import { apiRouter } from "./api";
import { auth, authRouter } from "./auth";
import { cdnRouter } from "./storage";
import { domain } from "./dns";
import { annualPrice, monthlyPrice, product } from "./stripe";

const CDN_DOMAIN = cdnRouter.url.apply((u) => new URL(u).hostname);

export const web = new sst.aws.Nextjs("WebApp", {
  path: "packages/web",
  domain: domain ? { name: "www." + domain } : undefined,
  link: [apiRouter, authRouter, auth, product, monthlyPrice, annualPrice],
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
