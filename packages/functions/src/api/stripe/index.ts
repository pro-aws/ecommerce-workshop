import { OpenAPIHono } from "@hono/zod-openapi";
import { StripeWebhookApi } from "./webhook";

export const stripe = new OpenAPIHono().route(
  "/webhook",
  StripeWebhookApi.route,
);
