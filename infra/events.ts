import { database } from "./database";
import { email } from "./email";
import { secret } from "./secret";

export const bus = new sst.aws.Bus("Bus");
bus.subscribe(
  {
    link: [secret.StripeSecret, secret.NeonDatabaseUrl, database, email],
    handler: "packages/functions/src/events/event.handler",
  },
  // {
  //   pattern: {
  //     detailType: ["shop.created"],
  //   },
  // },
);
