import { defaultShop } from "@/app/actions";
import { Session } from "@/lib/session";
import { cache } from "react";

function shopRoute(path: string) {
  return cache(async (slug?: string) => {
    const session = await Session.get();
    if (!session) return Routes.signin;
    if (slug) return `/${slug}${path}`;
    const shop = await defaultShop();
    if (typeof shop === "string") return Routes.shop.new;
    return `/${shop.slug}/${path}`;
  });
}

export const Routes = {
  home: "/",
  signin: "/auth/email",
  signout: "/auth/signout",
  shop: {
    new: "/shop",
    index: shopRoute(""),
    dashboard: shopRoute("/dashboard"),
    products: {
      index: shopRoute("/products"),
      new: shopRoute("/products/new"),
      edit: (slug: string, product: string) =>
        shopRoute(`/products/${product}`)(slug),
    },
    orders: shopRoute("/orders"),
    customers: shopRoute("/customers"),
    settings: shopRoute("/settings"),
    analytics: shopRoute("/analytics"),
  },
};

export default Routes;
