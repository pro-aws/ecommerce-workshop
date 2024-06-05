// SOLUTION: #1 We create and export `bus` and add a
// subscriber with the appropriate resources linked.
import { database } from "./database";
import { email } from "./email";
import { secret } from "./secret";

export const bus = new sst.aws.Bus("Bus");
bus.subscribe(
  {
    link: [secret.StripeSecret, secret.NeonDatabaseUrl, database, email],
    handler: "packages/functions/src/events/event.handler",
  },
  // NOTE: We can also limit a subscriber to only be sent events
  // based on a pattern defined like below. In our case we're keeping
  // it simple with a big switch statement, but you may have a use case
  // where the power of Rule matching is helpful or even necessary.
  //
  // {
  //   pattern: {
  //     detailType: ["shop.created"],
  //   },
  // },
  //
  // See https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-event-patterns.html
);
