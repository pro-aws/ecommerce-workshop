export const neonDatabaseUrl = process.env.NEON_DATABASE_URL;
export const useNeon = !!neonDatabaseUrl;

export const database = useNeon
  ? {}
  : new sst.aws.Postgres("Database", {
      scaling: { max: "2 ACU" },
    });
