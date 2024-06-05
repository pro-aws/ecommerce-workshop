import { neonDatabaseUrl, useNeon } from "./database";

export const secret = {
  StripeSecret: new sst.Secret("StripeSecretNew", process.env.STRIPE_API_KEY),
  NeonDatabaseUrl: useNeon
    ? new sst.Secret("NeonDatabaseUrl", neonDatabaseUrl)
    : {},
};
