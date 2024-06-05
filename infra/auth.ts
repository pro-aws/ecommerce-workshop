import { bus } from "./events";
import { database } from "./database";
import { domain } from "./dns";
import { email } from "./email";
import { secret } from "./secret";

export const auth = new sst.aws.Auth("Auth", {
  authenticator: {
    url: true,
    // TODO: #3 Similarly, we link the bus to our Auth.authenticator
    // so it can publish events as well
    link: [secret.StripeSecret, secret.NeonDatabaseUrl, database, bus, email],
    handler: "./packages/functions/src/auth.handler",
  },
});

export const authRouter = new sst.aws.Router("AuthRouter", {
  domain: domain ? "auth." + domain : undefined,
  routes: { "/*": auth.url },
});

export const outputs = {
  auth: authRouter.url,
};
