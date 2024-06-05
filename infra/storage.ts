// SOLUTION: #1 Draw the rest of the f*****g owl.
// Kidding, we created the sst.aws.Bucket and sst.aws.Router
// and exported them. Note that the bucket is public due to
// limitations with sst.aws.Router and origin access identities
// but I expect this to change in the future (or get a new Component).
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
