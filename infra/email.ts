import { domain } from "./dns";
const emailAddress = process.env.EMAIL_ADDRESS;
if (!emailAddress && !domain)
  throw new Error(
    "One of EMAIL_ADDRESS or CUSTOM_DOMAIN must be set in your `.env`",
  );

// SOLUTION: #1 Pretty straightforward here, no suprises.
// On deploy, this `Email` component will automatically verify
// our domain (if we have a Hosted Zone setup), or send an email
// for verification to the provided `emailAddress`.
export const email = new sst.aws.Email("Email", {
  sender: domain || emailAddress!,
});
