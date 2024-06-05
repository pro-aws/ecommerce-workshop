import { domain } from "./dns";
import { email } from "./email";

// TODO: #2 Now we need to create an `sst.aws.Auth` component
// pointing at our auth handler: `./packages/functions/src/auth.handler`.
// This component basically stands up an OAuth compliant service
// that makes it super simple to handle a variety auth flows.
export const auth = new sst.aws.Auth("Auth", {
  // TODO: #3 We configure an `authenticator` with is basically
  // a Lambda Function that implements our authentication logic.
  authenticator: {
    // TODO: #4 Any Lambda Function in SST can expose a "Function URL"
    // like this. We want onen in this case because we're going to
    // front our auth service with a CloudFront Distribution,
    // just like we did with our web and API functions.
    url: true,
    // TODO: #5 We link the email resource to our authenticator so that
    // the Lambda Function is about to grab the sender domain/address
    // at runtime through the `Resource` utility.
    link: [email],
    handler: "./packages/functions/src/auth.handler",
  },
});

// TODO: #6 Whew, lots of "me talking", not a lot of "you doing", so
// how about you go ahead and stand up an `sst.aws.Router` to front
// the auth service. You've already got a couple of examples from
// before. Make sure to handle custom domains; I'd recommend "auth.<domain>".
//
// export const authRouter = new sst.aws.Router("AuthRouter", ...

export const outputs = {
  auth: authRouter.url,
};
