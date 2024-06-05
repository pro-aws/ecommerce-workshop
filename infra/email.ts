import { domain } from "./dns";
const emailAddress = process.env.EMAIL_ADDRESS;
if (!emailAddress && !domain)
  throw new Error(
    "One of EMAIL_ADDRESS or CUSTOM_DOMAIN must be set in your `.env`",
  );

export const email = new sst.aws.Email("Email", {
  sender: domain || emailAddress!,
});
