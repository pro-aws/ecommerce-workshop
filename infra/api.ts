import { domain } from "./dns";
import { auth } from "./auth";

const api = new sst.aws.Function("Api", {
  url: true,
  streaming: !$dev,
  link: [auth],
  handler: "./packages/functions/src/api/index.handler",
});

export const apiRouter = new sst.aws.Router("ApiRouter", {
  domain: domain ? "api." + domain : undefined,
  routes: { "/*": api.url },
});

export const outputs = {
  api: apiRouter.url,
};
