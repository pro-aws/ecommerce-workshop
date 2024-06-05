import { neonDatabaseUrl, useNeon } from "./database";

export const secret = {
  NeonDatabaseUrl: useNeon
    ? new sst.Secret("NeonDatabaseUrl", neonDatabaseUrl)
    : {},
};
