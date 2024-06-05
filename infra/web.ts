import { apiRouter } from "./api";
import { auth, authRouter } from "./auth";
// TODO: #5 Review this file to see how and why
// we import the Router for our web apps.
import { cdnRouter } from "./storage";
import { domain } from "./dns";
import { annualPrice, monthlyPrice, product } from "./stripe";

// NOTE: We need this to configure next.config.js image.remotePatterns.
// We add this to the `environment` for both of our NextJS apps.
// See https://nextjs.org/docs/pages/api-reference/components/image#remotepatterns
const CDN_DOMAIN = cdnRouter.url.apply((u) => new URL(u).hostname);

export const web = new sst.aws.Nextjs("WebApp", {
  path: "packages/web",
  domain: domain ? { name: "www." + domain } : undefined,
  link: [apiRouter, authRouter, auth, product, monthlyPrice, annualPrice],
  // NOTE: As noted, we add the CDN_DOMAIN into the environment.
  environment: { CDN_DOMAIN },
});

export const store = new sst.aws.Nextjs("Store", {
  path: "packages/store",
  domain: domain
    ? {
        name: "store." + domain,
        aliases: ["*." + domain],
      }
    : undefined,
  link: [apiRouter, authRouter, auth],
  environment: {
    // NOTE: As noted, we add the CDN_DOMAIN into the environment.
    CDN_DOMAIN,
    NEXT_PUBLIC_ROOT_DOMAIN: $resolve([domain]).apply(
      ([domain]) => domain || "localhost:3001",
    ),
  },
});

export const outputs = {
  web: web.url,
  store: store.url,
};
