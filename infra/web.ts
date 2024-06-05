import { apiRouter } from "./api";
import { auth, authRouter } from "./auth";
import { domain } from "./dns";

export const web = new sst.aws.Nextjs("WebApp", {
  path: "packages/web",
  domain: domain ? { name: "www." + domain } : undefined,
  link: [apiRouter, authRouter, auth],
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
    NEXT_PUBLIC_ROOT_DOMAIN: $resolve([domain]).apply(
      ([domain]) => domain || "localhost:3001",
    ),
  },
});

export const outputs = {
  web: web.url,
  store: store.url,
};
