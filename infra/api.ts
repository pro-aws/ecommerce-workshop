import { domain } from "./dns";

// SOLUTION: #2 Nothing much to say here, it's a Function!
const api = new sst.aws.Function("Api", {
  url: true,
  handler: "./packages/functions/src/api/index.handler",
});

// SOLUTION: #3 Likewise, this is the `Router`, but there's
// a ton of stuff going on under the hood in configuring
// a CloudFront Distribution to properly front our API.
// This would be a zillion lines of CloudFormation, fwiw.
export const apiRouter = new sst.aws.Router("ApiRouter", {
  domain: domain ? "api." + domain : undefined,
  routes: { "/*": api.url },
});

export const outputs = {
  api: apiRouter.url,
};
