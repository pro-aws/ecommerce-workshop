import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { Product } from "@peasy-store/core/product/index";
import { assertActor } from "@peasy-store/core/actor";
import { Body, NotFound, Result } from "../common";
import { HTTPException } from "hono/http-exception";

export module ProductsApi {
  export const ProductSchema = Product.Info.openapi("Product");

  export const route = new OpenAPIHono()
    .openapi(
      createRoute({
        method: "get",
        path: "/",
        responses: {
          404: NotFound("No products found"),
          200: Result(ProductSchema.array(), "Returns products"),
        },
      }),
      async (c) => {
        assertActor("user");
        const products = await Product.list();
        if (!products)
          throw new HTTPException(404, { message: "No shops found" });
        return c.json({ result: products });
      },
    )
    .openapi(
      createRoute({
        method: "get",
        path: "/:slug",
        responses: {
          404: NotFound("Product not found"),
          200: Result(ProductSchema, "Returns product"),
        },
      }),
      async (c) => {
        assertActor("user");
        const product = await Product.fromSlug(c.req.param("slug"));
        if (!product)
          throw new HTTPException(404, { message: "Product not found" });
        return c.json({ result: product });
      },
    )
    .openapi(
      createRoute({
        method: "post",
        path: "/",
        request: Body(
          Product.Info.omit({
            id: true,
            slug: true,
            createdAt: true,
          }),
        ),
        responses: {
          200: Result(ProductSchema, "Returns product"),
        },
      }),
      async (c) => {
        assertActor("user");
        const body = c.req.valid("json");
        const { id, slug } = await Product.create(body);

        return c.json(
          {
            result: {
              ...body,
              images: undefined,
              id,
              slug,
              createdAt: new Date().toISOString(),
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
        request: Body(
          Product.Info.omit({
            id: true,
            slug: true,
            createdAt: true,
          }),
        ),
        responses: {
          200: Result(
            z.object({ status: z.literal("success") }),
            "Returns status",
          ),
        },
      }),
      async (c) => {
        assertActor("user");
        const body = c.req.valid("json");
        await Product.update({
          ...body,
          id: c.req.param("id"),
        });
        return c.json({ result: { status: "success" as const } }, 200);
      },
    )
    .openapi(
      createRoute({
        method: "delete",
        path: "/:id",
        responses: {
          200: Result(
            z.object({ status: z.literal("success") }),
            "Returns status",
          ),
        },
      }),
      async (c) => {
        assertActor("user");
        await Product.remove(c.req.param("id"));
        return c.json({ result: { status: "success" as const } }, 200);
      },
    );
}
