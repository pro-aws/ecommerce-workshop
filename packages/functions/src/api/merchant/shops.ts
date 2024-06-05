import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { Shop } from "@peasy-store/core/shop/index";
import { assertActor, withActor } from "@peasy-store/core/actor";
import { Body, NotFound, Result } from "../common";
import { HTTPException } from "hono/http-exception";
import { Account } from "@peasy-store/core/account/index";
import { User } from "@peasy-store/core/user/index";

export module ShopsApi {
  export const ShopSchema = Shop.Info.openapi("Shop");

  export const route = new OpenAPIHono()
    .openapi(
      createRoute({
        method: "get",
        path: "/",
        responses: {
          404: NotFound("No shops found"),
          200: Result(ShopSchema.array(), "Returns user's shops"),
        },
      }),
      async (c) => {
        assertActor("user");
        const shops = await Account.shops();
        if (!shops) throw new HTTPException(404, { message: "No shops found" });
        return c.json({ result: shops });
      },
    )
    .openapi(
      createRoute({
        method: "get",
        path: "/first",
        responses: {
          404: NotFound("No shops found"),
          200: Result(ShopSchema, "Returns shop"),
        },
      }),
      async (c) => {
        assertActor("account");
        const shop = await Account.shop();
        if (!shop) throw new HTTPException(404, { message: "No shops found" });
        return c.json({ result: shop });
      },
    )
    .openapi(
      createRoute({
        method: "post",
        path: "/",
        request: {
          body: {
            content: {
              "application/json": {
                schema: Shop.Info.pick({ name: true, slug: true }),
              },
            },
          },
        },
        responses: {
          200: Result(ShopSchema, "Returns shop"),
        },
      }),
      async (c) => {
        const actor = assertActor("account");
        const body = c.req.valid("json");
        const name = body.name;
        const slug = body.slug;

        const shopID = await Shop.create({ name, slug });
        await withActor(
          {
            type: "system",
            properties: { shopID },
          },
          async () => {
            await User.create(actor.properties.email);
          },
        );

        return c.json(
          {
            result: {
              id: shopID,
              name,
              slug,
              active: true,
            },
          },
          200,
        );
      },
    )
    .openapi(
      createRoute({
        method: "put",
        path: "/:id",
        request: Body(Shop.Info.pick({ name: true, slug: true })),
        responses: {
          200: Result(ShopSchema, "Returns shop"),
        },
      }),
      async (c) => {
        assertActor("account");
        const body = c.req.valid("json");
        const result = await Shop.update(body);
        return c.json({ result }, 200);
      },
    );
}
