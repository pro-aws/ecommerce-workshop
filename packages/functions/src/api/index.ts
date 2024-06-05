import { OpenAPIHono } from "@hono/zod-openapi";
import { logger } from "hono/logger";
import { compress } from "hono/compress";
import { handle, streamHandle } from "hono/aws-lambda";

const app = new OpenAPIHono();
app.use("*", logger());
app.use("*", compress());
app.use("*", async (c, next) => {
  await next();
  if (!c.res.headers.get("cache-control")) {
    c.header("cache-control", "no-store, max-age=0, must-revalidate, no-cache");
  }
});

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

export const handler = process.env.SST_LIVE ? handle(app) : streamHandle(app);
