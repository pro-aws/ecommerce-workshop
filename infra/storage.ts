// TODO: #1 we need to create an S3 Bucket (sst.aws.Bucket)
// for storing uploaded product images. As well, we want
// to put a CloudFront Distribution (sst.aws.Router) in
// front of the bucket for caching files close to our users.
//
// NOTE: If you have a custom domain, be sure to incorporate
// it into the Router `domain`. Follow the pattern from ./api.
//
// export const cdnBucket = ...
//
// export const cdnRouter = ...
//
// (Optional) Export outputs for printing the URL to the CLI.
// export const outputs = {
//   cdn: cdnRouter.url,
// };
