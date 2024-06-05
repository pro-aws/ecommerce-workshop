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
          // TODO: #5 This will look exactly like the last step.
          //
          // database: ...
          // secretArn: ...
          // resourceArn: ...
        },
      }),
});
