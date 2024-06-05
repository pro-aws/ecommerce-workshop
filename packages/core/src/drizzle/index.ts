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
      // SOLUTION: #4 We get the database connection details from
      // `Resource.Database`. Again, as a reminder, these are only
      // available because we linked our database resource to our
      // Lambda Functions (API and Auth).
      // @ts-ignore
      database: Resource.Database.database,
      // @ts-ignore
      secretArn: Resource.Database.secretArn,
      // @ts-ignore
      resourceArn: Resource.Database.clusterArn,
    });
