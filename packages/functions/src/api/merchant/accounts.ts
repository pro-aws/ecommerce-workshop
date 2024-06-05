import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { assertActor } from "@peasy-store/core/actor";
import { NotFound, Result } from "../common";

export module AccountsApi {
  export const AccountSchema = z
    .object({
      email: z.string().email(),
    })
    .openapi("Account");

  export const route = new OpenAPIHono().openapi(
    createRoute({
      method: "get",
      path: "/me",
      responses: {
        404: NotFound("Account not found"),
        200: Result(AccountSchema, "Returns account"),
      },
    }),
    async (c) => {
      const account = assertActor("account");
      return c.json({
        result: {
          email: account.properties.email,
        },
      });
    },
  );
}
