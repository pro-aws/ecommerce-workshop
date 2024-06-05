import { Resource } from "sst";
import { Pool as NeonPool } from "@neondatabase/serverless";
import { RDSDataClient } from "@aws-sdk/client-rds-data";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-serverless";
import { drizzle as drizzleAws } from "drizzle-orm/aws-data-api/pg";

export const useNeon = "NeonDatabaseUrl" in Resource;
export const neonDatabaseUrl = useNeon
  ? // @ts-ignore
    Resource.NeonDatabaseUrl.value
  : undefined;

export const db = useNeon
  ? drizzleNeon(new NeonPool({ connectionString: neonDatabaseUrl }))
  : drizzleAws(new RDSDataClient({}), {
      // TODO: #4 See if you can figure out where
      // to find these values. Hint: they're only
      // available here because we linked the database
      // to our API and Auth Functions. Another hint:
      // if you're not getting TypeScript hints, make
      // sure you're running `sst dev`.
      //
      // database: ...
      // secretArn: ...
      // resourceArn: ...
    });
