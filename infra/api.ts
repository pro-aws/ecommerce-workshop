import { domain } from "./dns";

// TODO: #1 We begin by defining our API. We just want to
// get a basic "Hello World" in place connecting our API
// and frontend.
//
// We'll define two resources as the basis for our API:
// - `sst.aws.Function` is a Lambda Function where our code runs.
// - `sst.aws.Router` is a CloudFront distribution that sits
//   in front of our Function and serves it to the world.
//
// Kick us off by using these two SST Components to create
// our resources.
//
// TODO: #2 The `api` Function needs to expose a "Function URL", and
// point at our handler code: `./packages/functions/src/api/index.handler`.
// const api = new sst.aws.Function("Api", ...
//
// TODO: #3 The `apiRouter` Distribution needs `routes` defined and
// our custom domain (I recommend `"api." + domain`). For the
// `routes`, we just want to point everything at `api.url`.
// export const apiRouter = new sst.aws.Router("ApiRouter", ....

// TODO: #4 SST prints anything we export through `outputs` in the CLI.
export const outputs = {
  api: apiRouter.url,
};
