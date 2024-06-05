import { OpenAPIHono } from "@hono/zod-openapi";
import { AuthMiddleware } from "../middleware/auth";
import { AccountsApi } from "./accounts";

export const merchant = new OpenAPIHono()
  .use("*", AuthMiddleware)
  .route("/accounts", AccountsApi.route);
