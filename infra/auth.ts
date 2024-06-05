import { bus } from "./events";
import { database } from "./database";
import { domain } from "./dns";
import { email } from "./email";
import { secret } from "./secret";

export const auth = new sst.aws.Auth("Auth", {
  authenticator: {
    url: true,
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
