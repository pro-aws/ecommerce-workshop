import { domain } from "./dns";

export const cdnBucket = new sst.aws.Bucket("CdnBucket", {
  public: true,
});

export const cdnRouter = new sst.aws.Router("CdnRouter", {
  domain: domain ? "cdn." + domain : undefined,
  routes: { "/*": cdnBucket.domain.apply((d) => `https://${d}`) },
});

export const outputs = {
  cdn: cdnRouter.url,
};
