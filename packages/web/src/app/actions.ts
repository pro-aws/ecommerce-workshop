"use server";

import { cache } from "react";
import { client, handleResponse, t } from "@/lib/api";
import { redirect } from "next/navigation";
import { Resource } from "sst";
import { headers } from "next/headers";
import Routes from "@/lib/routes";
import { InferRequestType } from "hono/client";

export const signin = async (email: string) => {
  const headersList = headers();
  const host = headersList.get("X-Forwarded-Host");
  const proto = headersList.get("X-Forwarded-Proto");
  const origin = `${proto}://${host}`;
  const params = new URLSearchParams({
    email,
    grant_type: "authorization_code",
    client_id: "web",
    redirect_uri: origin + "/auth/callback",
    response_type: "code",
    provider: "code",
  }).toString();

  return redirect(Resource.AuthRouter.url + "/code/authorize?" + params);
};

export const authCallback = async (code: string) => {
  return redirect(
    Resource.AuthRouter.url + "/code/callback?" + new URLSearchParams({ code }),
  );
};

export const getAccount = cache(async () => {
  const res = await client().merchant.accounts.me.$get();
  return handleResponse(res);
});

export const defaultShop = cache(async () => {
  const res = await client().merchant.shops.first.$get();
  return handleResponse(res);
});

export const createShop = cache(
  async (params: {
    name: string;
    slug: string;
    annual?: boolean;
    baseUrl: string;
  }) => {
    const res = await client().merchant.shops.$post({
      json: {
        name: params.name,
        slug: params.slug,
        annual: params.annual,
        successUrl: params.baseUrl + (await Routes.shop.index(params.slug)),
        cancelUrl: params.baseUrl + Routes.shop.new,
      },
    });
    const handled = await handleResponse(res);
    if (typeof handled === "string") return handled;

    if (handled.url) return redirect(handled.url);
    return handled;
  },
);

export const updateShop = cache(
  async (params: { id: string; name: string; slug: string }) => {
    try {
      const res = await client().merchant.shops[":id"].$put({
        param: { id: params.id },
        json: {
          name: params.name,
          slug: params.slug,
        },
      });
      return handleResponse(res);
    } catch (e) {
      if (typeof e === "string") {
        return e;
      } else if (e instanceof Error) {
        return e.message;
      }
    }

    return "Unknown error occurred. Please try again later.";
  },
);

export const listProducts = cache(async () => {
  const res = await client().merchant.products.$get();
  return handleResponse(res);
});

export const getProduct = cache(async (slug: string) => {
  const res = await client().merchant.products[":slug"].$get({
    param: { slug },
  });
  return handleResponse(res);
});

export const archiveProduct = cache(async (product: string) => {
  const res = await client().merchant.products[":id"].$delete({
    param: { id: product },
  });
  return handleResponse(res);
});

export const createProduct = cache(
  async (props: InferRequestType<typeof t.merchant.products.$post>["json"]) => {
    const res = await client().merchant.products.$post({
      json: props,
    });
    return handleResponse(res);
  },
);

export const updateProduct = cache(
  async (params: {
    id: string;
    name: string;
    images: string[];
    description?: string | null | undefined;
    price: number;
    status: "active" | "draft" | "archived";
  }) => {
    try {
      const res = await client().merchant.products[":id"].$put({
        param: { id: params.id },
        json: {
          name: params.name,
          images: params.images,
          description: params.description || undefined,
          price: params.price,
          status: params.status,
        },
      });
      return handleResponse(res);
    } catch (e) {
      if (typeof e === "string") {
        return e;
      } else if (e instanceof Error) {
        return e.message;
      }
    }

    return "Unknown error occurred. Please try again later.";
  },
);

export const createFile = cache(
  async (props: InferRequestType<typeof t.merchant.files.$post>["json"]) => {
    const res = await client().merchant.files.$post({
      json: props,
    });
    return handleResponse(res);
  },
);

export const generateProductDescription = cache(
  async (
    props: InferRequestType<
      typeof t.merchant.products.description.$post
    >["json"],
  ) => {
    const res = await client().merchant.products.description.$post({
      json: props,
    });
    return handleResponse(res);
  },
);

type ApiCall = (...args: any) => Promise<any>;
type ApiResponse<T extends ApiCall> = Exclude<Awaited<ReturnType<T>>, string>;

export type Account = ApiResponse<typeof getAccount>;
export type Shop = ApiResponse<typeof defaultShop>;
export type Product = ApiResponse<typeof getProduct>;
export type Image = ApiResponse<typeof createFile>;
