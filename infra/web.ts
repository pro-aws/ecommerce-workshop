import { apiRouter } from "./api";
import { auth, authRouter } from "./auth";
import { domain } from "./dns";

export const web = new sst.aws.Nextjs("WebApp", {
  path: "packages/web",
  domain: domain ? { name: "www." + domain } : undefined,
  // TODO: #7 We need to link the `authRouter` to our web
  // resource so that it can pull the URL at runtime. Look
  // ma, no environment variables!
  link: [apiRouter, authRouter, auth],
});

export const outputs = {
  web: web.url,
};
