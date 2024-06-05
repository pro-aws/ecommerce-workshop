import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { withActor } from "@peasy-store/core/actor";
import { Stripe, stripe } from "@peasy-store/core/stripe/index";
import { Context } from "hono";
import { Resource } from "sst";
import { bus } from "sst/aws/bus";

export module StripeWebhookApi {
  const responses = {
    200: {
      content: { "application/json": { schema: z.object({}) } },
      description: "Returns an empty object to Stripe",
    },
  };

  const validateEvent = async (c: Context, secret: string) => {
    const sig = c.req.header("stripe-signature");
    const event = await stripe.webhooks.constructEventAsync(
      await c.req.text(),
      sig!,
      secret,
    );
    return event;
  };

  export const route = new OpenAPIHono()
    .openapi(
      createRoute({
        method: "post",
        path: "/",
        responses,
      }),
      async (c) => {
        const event = await validateEvent(c, Resource.StripeWebhook.secret);
        switch (event.type) {
          case "customer.subscription.created":
          case "customer.subscription.updated":
          case "customer.subscription.deleted":
            const {
              id: subscriptionID,
              customer,
              items,
              status,
              metadata: { shopID },
            } = event.data.object;
            if (!shopID) throw new Error("ShopID not found in metadata");

            const type = event.type.split(
              ".",
            )[2] as (typeof Stripe.CustomerSubscriptionEventType)[number];

            await withActor(
              {
                type: "system",
                properties: { shopID },
              },
              () =>
                bus.publish(
                  Resource.Bus,
                  Stripe.Events.CustomerSubscriptionEvent,
                  {
                    type,
                    status,
                    shopID,
                    customerID: customer.toString(),
                    subscriptionID,
                    subscriptionItemID: items.data[0]!.id,
                  },
                ),
            );
            break;
        }
        console.log(event);
        return c.json({});
      },
    )
    .openapi(
      createRoute({
        method: "post",
        path: "/connect",
        responses,
      }),
      async (c) => {
        const event = await validateEvent(
          c,
          Resource.StripeConnectWebhook.secret,
        );
        switch (event.type) {
        }
        console.log(event);
        return c.json({});
      },
    );
}
