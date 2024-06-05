export const neonDatabaseUrl = process.env.NEON_DATABASE_URL;
export const useNeon = !!neonDatabaseUrl;

// SOLUTION: #1 We create an `sst.aws.Postgres` resource
// named, "Database" (available at `Resource.Database` at runtime)
// and add the `scaling` config to set a max size of 2 ACU.
//
// Read more about ACU's and Serverless v2 scaling here:
// https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/aurora-serverless-v2.how-it-works.html#aurora-serverless-v2.how-it-works.capacity
export const database = useNeon
  ? {}
  : new sst.aws.Postgres("Database", {
      scaling: { max: "2 ACU" },
    });
