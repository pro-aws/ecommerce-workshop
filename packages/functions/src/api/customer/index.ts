import { OpenAPIHono } from "@hono/zod-openapi";
import { UserApi } from "./user";
import { ShopsApi } from "./shops";

export const customer = new OpenAPIHono()
  .route("/user", UserApi.route)
  .route("/shops", ShopsApi.route);
