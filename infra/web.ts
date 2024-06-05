import { apiRouter } from "./api";
import { auth, authRouter } from "./auth";
import { domain } from "./dns";

export const web = new sst.aws.Nextjs("WebApp", {
  path: "packages/web",
  domain: domain ? { name: "www." + domain } : undefined,
  link: [apiRouter, authRouter, auth],
});

export const outputs = {
  web: web.url,
};
