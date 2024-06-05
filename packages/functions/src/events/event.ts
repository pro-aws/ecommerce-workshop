import { bus } from "sst/aws/bus";
import { withActor } from "@peasy-store/core/actor";
import { Account } from "@peasy-store/core/account/index";
import { Shop } from "@peasy-store/core/shop/index";
import { Stripe } from "@peasy-store/core/stripe/index";

// TODO: #4 Here we define our event handler with `bus.subscriber`.
// We're able to define the events we want to handle and this gives
// use type safety within the handler.
export const handler = bus.subscriber(
  [
    // TODO: #5 In this case, we're subscribing to all of the events
    // we've defined in the app, but you could bust these out into
    // separate handlers in separate files as your app grows in complexity.
    Account.Events.Created,
    Shop.Events.Created,
    Shop.Events.Updated,
    Stripe.Events.CustomerSubscriptionEvent,
  ],
  async (event) =>
    withActor(event.metadata.actor, async () => {
      console.log("event", event);
      switch (event.type) {
        // TODO: #9 Back in our event handler, we send a welcome email
        // to the user when an account is created. This is a classic
        // case where it makes sense to offload the work out of an
        // API call and into an asynchronous event handler.
        case "account.created":
          await Account.sendWelcomeEmail(event.properties.email);
          break;
        // TODO: #10 For now we're ignoring these events, but...
        case "shop.created":
        case "shop.updated":
          break;
        // TODO: #11 We are handling Stripe events on the EventBus.
        // Stripe recommends adding durability to your webhook endpoints
        // so that you're not trying to process them synchronously.
        // https://docs.stripe.com/webhooks#handle-events-asynchrounously
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
