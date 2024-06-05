import { bus } from "sst/aws/bus";
import { withActor } from "@peasy-store/core/actor";
import { Account } from "@peasy-store/core/account/index";
import { Shop } from "@peasy-store/core/shop/index";
import { Stripe } from "@peasy-store/core/stripe/index";

export const handler = bus.subscriber(
  [
    Account.Events.Created,
    Shop.Events.Created,
    Shop.Events.Updated,
    Stripe.Events.CustomerSubscriptionEvent,
  ],
  async (event) =>
    withActor(event.metadata.actor, async () => {
      console.log("event", event);
      switch (event.type) {
        case "account.created":
          await Account.sendWelcomeEmail(event.properties.email);
          break;
        case "shop.created":
        case "shop.updated":
          break;
        case "stripe.customer-subscription-event":
          let item = await Stripe.fromCustomerID(event.properties.customerID);
          if (!item) throw new Error("Shop not found for customer");

          const status = event.properties.status;
          const subscriptionID = event.properties.subscriptionID;
          if (event.properties.type === "deleted") {
            await Stripe.removeSubscription(subscriptionID);
            await Shop.updateActive();
            return;
          }

          if (
            event.properties.type === "created" ||
            event.properties.type === "updated"
          ) {
            item = await Stripe.setSubscription(event.properties);
          }

          if (status === "active" && item?.standing !== "good") {
            await Stripe.setStanding({
              subscriptionID,
              standing: "good",
            });
            await Shop.updateActive();
          } else if (status === "past_due" && item?.standing !== "overdue") {
            await Stripe.setStanding({
              subscriptionID,
              standing: "overdue",
            });
            await Shop.updateActive();
          }
          break;
      }
    }),
);
