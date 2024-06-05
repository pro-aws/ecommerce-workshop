import { OpenAPIHono } from "@hono/zod-openapi";
import { AuthMiddleware } from "../middleware/auth";
import { UsersApi } from "./users";
import { AccountsApi } from "./accounts";
import { ShopsApi } from "./shops";
import { ProductsApi } from "./products";

export const merchant = new OpenAPIHono()
  .use("*", AuthMiddleware)
  .route("/accounts", AccountsApi.route)
  .route("/shops", ShopsApi.route)
  .route("/products", ProductsApi.route)
  .route("/users", UsersApi.route);
