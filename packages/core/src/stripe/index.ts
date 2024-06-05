import { Resource } from "sst";
import StripeSDK from "stripe";
import { z } from "zod";
import { fn } from "../util/fn";
import { Standing, stripeTable } from "./stripe.sql";
import { useTransaction } from "../drizzle/transaction";
import { eq, and } from "drizzle-orm";
import { event } from "../event";
import { Shop } from "../shop";

export const stripe = new StripeSDK(Resource.StripeSecretNew.value, {
  httpClient: StripeSDK.createFetchHttpClient(),
});

export module Stripe {
  export const Info = z.object({
    shopID: z.string(),
    customerID: z.string(),
    subscriptionID: z.string().nullable(),
    subscriptionItemID: z.string().nullable(),
    standing: z.enum(Standing),
  });
  export const Checkout = z.object({
    annual: z.boolean().optional(),
    successUrl: z.string(),
    cancelUrl: z.string(),
  });
  export const CheckoutSession = z.object({
    url: z.string().nullable(),
  });
  export const CustomerSubscriptionEventType = [
    "created",
    "updated",
    "deleted",
  ] as const;

  export const Events = {
    CustomerSubscriptionEvent: event(
      "stripe.customer-subscription-event",
      z.object({
        type: z.enum(CustomerSubscriptionEventType),
        status: z.string(),
        shopID: z.string().min(1),
        customerID: z.string().min(1),
        subscriptionID: z.string().min(1),
        subscriptionItemID: z.string().min(1),
      }),
    ),
  };

  export function get() {
    return useTransaction(async (tx) =>
      tx
        .select()
        .from(stripeTable)
        .where(eq(stripeTable.shopID, Shop.use()))
        .execute()
        .then((rows) => rows.map(serialize).at(0)),
    );
  }

  export const setCustomerID = fn(Info.shape.customerID, async (customerID) =>
    useTransaction(async (tx) =>
      tx
        .insert(stripeTable)
        .values({
          shopID: Shop.use(),
          customerID,
          standing: "new",
        })
        .execute(),
    ),
  );

  export const setSubscription = fn(
    Info.pick({
      subscriptionID: true,
      subscriptionItemID: true,
    }),
    (input) =>
      useTransaction(async (tx) =>
        tx
          .update(stripeTable)
          .set({
            subscriptionID: input.subscriptionID,
            subscriptionItemID: input.subscriptionItemID,
          })
          .where(eq(stripeTable.shopID, Shop.use()))
          .returning()
          .execute()
          .then((rows) => rows.map(serialize).at(0)),
      ),
  );

  export const setStanding = fn(
    Info.pick({
      subscriptionID: true,
      standing: true,
    }),
    (input) =>
      useTransaction((tx) =>
        tx
          .update(stripeTable)
          .set({ standing: input.standing })
          .where(and(eq(stripeTable.subscriptionID, input.subscriptionID!)))
          .execute(),
      ),
  );

  export const removeSubscription = fn(
    z.string().min(1),
    (stripeSubscriptionID) =>
      useTransaction((tx) =>
        tx
          .update(stripeTable)
          .set({
            subscriptionItemID: null,
            subscriptionID: null,
          })
          .where(and(eq(stripeTable.subscriptionID, stripeSubscriptionID)))
          .execute(),
      ),
  );

  export const fromCustomerID = fn(Info.shape.customerID, (customerID) =>
    useTransaction((tx) =>
      tx
        .select()
        .from(stripeTable)
        .where(and(eq(stripeTable.customerID, customerID)))
        .execute()
        .then((rows) => rows.map(serialize).at(0)),
    ),
  );

  function serialize(
    input: typeof stripeTable.$inferSelect,
  ): z.infer<typeof Info> {
    return {
      shopID: input.shopID,
      customerID: input.customerID,
      subscriptionID: input.subscriptionID,
      subscriptionItemID: input.subscriptionItemID,
      standing: input.standing,
    };
  }
}
