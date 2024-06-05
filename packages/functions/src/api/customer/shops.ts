import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { Shop } from "@peasy-store/core/shop/index";
import { NotFound, Result } from "../common";
import { HTTPException } from "hono/http-exception";
import { Product } from "@peasy-store/core/product/index";

export module ShopsApi {
  export const ShopSchema = Shop.Info.openapi("Shop");
  export const ProductSchema = Product.Info.openapi("Product");

  export const route = new OpenAPIHono()
    .openapi(
      createRoute({
        method: "get",
        path: "/:slug",
        responses: {
          404: NotFound("No shops found"),
          200: Result(ShopSchema, "Returns shop"),
        },
      }),
      async (c) => {
        const shop = await Shop.fromSlug(c.req.param("slug"));
        if (!shop) throw new HTTPException(404, { message: "No shops found" });
        return c.json({ result: shop });
      },
    )
    .openapi(
      createRoute({
        method: "get",
        path: "/:slug/products",
        responses: {
          404: NotFound("No products found"),
          200: Result(ProductSchema.array(), "Returns shop's products"),
        },
      }),
      async (c) => {
        const products = await Product.fromShopSlug(c.req.param("slug"));
        if (!products)
          throw new HTTPException(404, { message: "No products found" });
        return c.json({ result: products });
      },
    );
}
