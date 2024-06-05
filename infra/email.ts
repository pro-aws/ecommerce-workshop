import { domain } from "./dns";
const emailAddress = process.env.EMAIL_ADDRESS;
if (!emailAddress && !domain)
  throw new Error(
    "One of EMAIL_ADDRESS or CUSTOM_DOMAIN must be set in your `.env`",
  );

// TODO: #1 Let's start with email. SES is basically configured in
// every new account and you could technically start interacting
// with it through the SDK right away, but there's one piece you'll
// need in order to send emails: a verified "Identity". Identities
// can be an email address or a domain (validated through DNS).
//
// SST Ion has a convenient Component for this: `sst.aws.Email`.
// Go ahead and create one named "Email" and configure the `sender` prop to
// use your configured domain or email address.
//
// export const email = ...
//
// NOTE: If you wondered why I'm being picky about the name "Email",
// it's because we'll import the email sender from `Resource.Email`
// in a bit. More on that later.
