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

const api = new sst.aws.Function("Api", {
  url: true,
  streaming: !$dev,
  link: [
    secret.StripeSecret,
    secret.NeonDatabaseUrl,
    database,
    // TODO: #2 We link the event bus to our API function
    // so that our API is able to publish to the EventBus.
    bus,
    email,
    auth,
    product,
    monthlyPrice,
    annualPrice,
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
