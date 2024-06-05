import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { Account } from "@peasy-store/core/account/index";
import { assertActor } from "@peasy-store/core/actor";
import { NotFound, Result } from "../common";

export module AccountsApi {
  export const AccountSchema = Account.Info.openapi("Account");

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
          id: account.properties.accountID,
          email: account.properties.email,
          shops: await Account.shops(),
        },
      });
    },
  );
}
