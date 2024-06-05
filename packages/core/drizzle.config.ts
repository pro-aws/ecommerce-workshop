import { Resource } from "sst";
import { defineConfig } from "drizzle-kit";
import { neonDatabaseUrl, useNeon } from "./src/drizzle";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/**/*.sql.ts",
  out: "./migrations",
  strict: true,
  verbose: true,
  ...(useNeon
    ? { dbCredentials: { url: neonDatabaseUrl } }
    : {
        driver: "aws-data-api",
        dbCredentials: {
          // SOLUTION: #5 Predicatable based on the last change.
          database: Resource.Database.database,
          secretArn: Resource.Database.secretArn,
          resourceArn: Resource.Database.clusterArn,
        },
      }),
});
