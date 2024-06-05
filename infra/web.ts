import { apiRouter } from "./api";
import { domain } from "./dns";

// SOLUTION: #7 The `Nextjs` Component is built around
// the OpenNext project (https://open-next.js.org/) and
// it's an incredible open source effort to mimic the
// infrastructure and behavior of NextJS apps running on Vercel.
export const web = new sst.aws.Nextjs("WebApp", {
  path: "packages/web",
  domain: domain ? { name: "www." + domain } : undefined,
  link: [apiRouter],
});

export const outputs = {
  web: web.url,
};
