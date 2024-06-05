import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { Shop } from "@peasy-store/core/shop/index";
import { assertActor, withActor } from "@peasy-store/core/actor";
import { User } from "@peasy-store/core/user/index";
import { Body, NotFound, Result } from "../common";
import { HTTPException } from "hono/http-exception";
import { Account } from "@peasy-store/core/account/index";
import { Stripe, stripe } from "@peasy-store/core/stripe/index";
import { Resource } from "sst";

export module ShopsApi {
  export const ShopSchema = Shop.Info.openapi("Shop");

  export const route = new OpenAPIHono()
    .openapi(
      createRoute({
        method: "get",
        path: "/",
        responses: {
          404: NotFound("No shops found"),
          200: Result(ShopSchema.array(), "Returns user's shops"),
        },
      }),
      async (c) => {
        assertActor("user");
        const shops = await Account.shops();
        if (!shops) throw new HTTPException(404, { message: "No shops found" });
        return c.json({ result: shops });
      },
    )
    .openapi(
      createRoute({
        method: "get",
        path: "/first",
        responses: {
          404: NotFound("No shops found"),
          200: Result(ShopSchema, "Returns shop"),
        },
      }),
      async (c) => {
        assertActor("account");
        const shop = await Account.shop();
        if (!shop) throw new HTTPException(404, { message: "No shops found" });
        return c.json({ result: shop });
      },
    )
    .openapi(
      createRoute({
        method: "post",
        path: "/",
        request: {
          body: {
            content: {
              "application/json": {
                schema: Shop.Info.pick({ name: true, slug: true }).extend(
                  Stripe.Checkout.shape,
                ),
              },
            },
          },
        },
        responses: {
          200: Result(
            ShopSchema.extend(Stripe.CheckoutSession.shape),
            "Returns shop and Stripe checkout session URL",
          ),
        },
      }),
      async (c) => {
        const actor = assertActor("account");
        const body = c.req.valid("json");
        const name = body.name;
        const slug = body.slug;

        const shopID = await Shop.create({ name, slug });
        const checkoutSession = await withActor(
          {
            type: "system",
            properties: { shopID },
          },
          async () => {
            await User.create(actor.properties.email);

            const subscription = await Stripe.get();
            let customerID = subscription?.customerID;
            if (!customerID) {
              const customer = await stripe.customers.create({
                name,
                email: actor.properties.email,
                metadata: { shopID },
              });
              customerID = customer.id;
              await Stripe.setCustomerID(customerID);
            }

            const price = body.annual
              ? Resource.StripeAnnualPrice.id
              : Resource.StripeMonthlyPrice.id;

            const session = await stripe.checkout.sessions.create({
              mode: "subscription",
              customer: customerID,
              subscription_data: { metadata: { shopID } },
              line_items: [{ price, quantity: 1 }],
              success_url: `${body.successUrl}?session_id={CHECKOUT_SESSION_ID}`,
              cancel_url: body.cancelUrl,
            });

            return session;
          },
        );

        return c.json(
          {
            result: {
              id: shopID,
              name,
              slug,
              active: false,
              url: checkoutSession.url,
            },
          },
          200,
        );
      },
    )
    .openapi(
      createRoute({
        method: "put",
        path: "/:id",
        request: Body(Shop.Info.pick({ name: true, slug: true })),
        responses: {
          200: Result(
            ShopSchema,
            "Returns shop and Stripe checkout session URL",
          ),
        },
      }),
      async (c) => {
        assertActor("account");
        const body = c.req.valid("json");
        const result = await Shop.update(body);
        return c.json({ result }, 200);
      },
    );
}
