import { domain } from "./dns";
import { auth } from "./auth";
import { secret } from "./secret";
import { database } from "./database";
import { email } from "./email";

const api = new sst.aws.Function("Api", {
  url: true,
  streaming: !$dev,
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
