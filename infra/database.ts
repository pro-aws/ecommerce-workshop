export const neonDatabaseUrl = process.env.NEON_DATABASE_URL;
export const useNeon = !!neonDatabaseUrl;

// TODO: #1 RDS Aurora PostgreSQL Serverless v2 is a mouthful.
// `sst.aws.Postgres` wraps this particular AWS service config
// into a nice component that we can define below.
//
// Even if you're using Neon to avoid costs, I want you to get
// familiar with this component and define one anyway; the `useNeon`
// flag will ensure that the Cluster and Instance aren't created in
// your AWS account.
//
// If you *are* using Aurora Postgres, see if you
// can figure out how to set an upper threshold on scaling to
// reduce costs (try `2 ACU`). You'll also want to stop the database
// after the workshop so it isn't running up a bill the rest of the month!

// export const database = useNeon ? {} : ...
