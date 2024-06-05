import { domain } from "./dns";

$linkable(stripe.WebhookEndpoint, function (resource) {
  return {
    properties: {
      secret: resource.secret,
    },
  };
});

$linkable(stripe.Product, function (resource) {
  return {
    properties: {
      id: resource.id,
      name: resource.name,
    },
  };
});

$linkable(stripe.Price, function (resource) {
  return {
    properties: {
      id: resource.id,
      unitAmount: resource.unitAmount,
    },
  };
});

export const product = new stripe.Product("StripeProduct", {
  name: "Peasy Shop",
  unitLabel: "shop",
  description: "A Peasy shop is the best place to sell your goods online.",
});

export const monthlyPrice = new stripe.Price("StripeMonthlyPrice", {
  product: product.id,
  unitAmount: 10 * 100,
  currency: "usd",
  recurring: { interval: "month", intervalCount: 1 },
});

export const annualPrice = new stripe.Price("StripeAnnualPrice", {
  product: product.id,
  unitAmount: 100 * 100,
  currency: "usd",
  recurring: { interval: "year", intervalCount: 1 },
});

export const webhookPath = "/stripe/webhook";
export const webhook = new stripe.WebhookEndpoint("StripeWebhook", {
  url: domain
    ? $interpolate`https://api.${domain}${webhookPath}`
    : "https://proaws.dev/placeholder", // placeholder until $resolve can update this
  metadata: { stage: $app.stage },
  enabledEvents: [
    "customer.subscription.created",
    "customer.subscription.updated",
    "customer.subscription.deleted",
  ],
});

export const connectWebhookPath = "/stripe/webhook/connect";
export const connectWebhook = new stripe.WebhookEndpoint(
  "StripeConnectWebhook",
  {
    url: domain
      ? $interpolate`https://api.${domain}${connectWebhookPath}`
      : "https://proaws.dev/placeholder", // placeholder until $resolve can update this
    metadata: { stage: $app.stage },
    enabledEvents: ["*"],
    connect: true,
  },
);
