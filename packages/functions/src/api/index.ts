import { OpenAPIHono } from "@hono/zod-openapi";
import { logger } from "hono/logger";
import { compress } from "hono/compress";
import { handle } from "hono/aws-lambda";

const app = new OpenAPIHono();
app.use("*", logger());
app.use("*", compress());
app.use("*", async (c, next) => {
  await next();
  if (!c.res.headers.get("cache-control")) {
    c.header("cache-control", "no-store, max-age=0, must-revalidate, no-cache");
  }
});

// TODO: #5 In this project, we're using Hono to define our API
// and we're starting with a simple "Hello, world!" response at the root.
app.get("/", async (c) => {
  return c.json({
    message: "Hello, world!",
  });
});

app.doc("/doc", () => ({
  openapi: "3.0.0",
  info: {
    title: "Peasy Store API",
    version: "0.0.1",
  },
}));

// TODO: #6 We export a handler for our API. This is the entry point for our
// Lambda Function. `handle` comes from Hono, it's an adapter for AWS Lambda.
export const handler = handle(app);
