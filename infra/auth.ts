import { domain } from "./dns";
import { email } from "./email";

export const auth = new sst.aws.Auth("Auth", {
  authenticator: {
    url: true,
    link: [email],
    handler: "./packages/functions/src/auth.handler",
  },
});

// SOLUTION: #6 Third time's a charm?! Did you figure it out??
export const authRouter = new sst.aws.Router("AuthRouter", {
  domain: domain ? "auth." + domain : undefined,
  routes: { "/*": auth.url },
});

export const outputs = {
  auth: authRouter.url,
};
