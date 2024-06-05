import { domain } from "./dns";
import { auth } from "./auth";
import { secret } from "./secret";
import { database } from "./database";
import { email } from "./email";

const api = new sst.aws.Function("Api", {
  url: true,
  streaming: !$dev,
  // TODO: #2 We link the exported database to our API
  // so that the API is given IAM permissions to write
  // to the database, and so that we can extract the
  // database connection details from `Resource.Database`.
  link: [secret.NeonDatabaseUrl, database, email, auth],
  handler: "./packages/functions/src/api/index.handler",
});

export const apiRouter = new sst.aws.Router("ApiRouter", {
  domain: domain ? "api." + domain : undefined,
  routes: { "/*": api.url },
});

export const outputs = {
  api: apiRouter.url,
};
