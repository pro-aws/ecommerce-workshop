import { domain } from "./dns";
import { auth } from "./auth";
import {
  product,
  monthlyPrice,
  annualPrice,
  webhook,
  connectWebhook,
  webhookPath,
  connectWebhookPath,
} from "./stripe";
import { secret } from "./secret";
import { database } from "./database";
import { bus } from "./events";
import { email } from "./email";
import { cdnBucket, cdnRouter } from "./storage";

const api = new sst.aws.Function("Api", {
  url: true,
  streaming: !$dev,
  link: [
    secret.StripeSecret,
    secret.NeonDatabaseUrl,
    database,
    bus,
    email,
    auth,
    product,
    monthlyPrice,
    annualPrice,
    // TODO: #2 We link both the Bucket and Router here.
    //
    // Linking the Bucket gives our API Lambda Function
    // the permissions to create presigned URLs for putting
    // objects into the Bucket so that users can upload from
    // their browser directly.
    //
    // Linking the Router will allow us to grab the URL, which
    // we'll need in our API to return absolute URLs to the app.
    cdnBucket,
    cdnRouter,
    webhook,
    connectWebhook,
  ],
  handler: "./packages/functions/src/api/index.handler",
});

export const apiRouter = new sst.aws.Router("ApiRouter", {
  domain: domain ? "api." + domain : undefined,
  routes: { "/*": api.url },
});

export const outputs = {
  api: apiRouter.url,
};

// This is for those that don't have a custom domain setup.
// We wait for the API router (CloudFront Distribution) and the
// Stripe webhooks to be created and then update them to point to
// the correct webhook endpoint. We'd put the correct URL into the
// stripe resource to start with, but it creates a circular reference.
// Wow this comment looks good, each line longer than the last. Oops.
import Stripe from "stripe";
if (!domain) {
  $resolve([apiRouter.url, webhook.id, connectWebhook.id]).apply(
    async ([apiUrl, id, connectId]) => {
      const stripe = new Stripe(process.env.STRIPE_API_KEY!);
      await Promise.all([
        stripe.webhookEndpoints.update(id, { url: `${apiUrl}${webhookPath}` }),
        stripe.webhookEndpoints.update(connectId, {
          url: `${apiUrl}${connectWebhookPath}`,
        }),
      ]);
    },
  );
}
