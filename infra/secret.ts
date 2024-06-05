import { neonDatabaseUrl, useNeon } from "./database";

export const secret = {
  StripeSecret: new sst.Secret("StripeSecret", process.env.STRIPE_API_KEY),
  NeonDatabaseUrl: useNeon
    ? new sst.Secret("NeonDatabaseUrl", neonDatabaseUrl)
    : {},
};
