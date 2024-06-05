'use server';

import { cache } from 'react';
import { client, handleResponse, t } from '@/lib/api';
// import { redirect } from 'next/navigation';
// import { InferRequestType } from 'hono/client';

export const getShop = cache(async (slug: string) => {
  const res = await client().customer.shops[':slug'].$get({ param: { slug } });
  return handleResponse(res);
});

export const getProducts = cache(async (shop: string) => {
  const res = await client().customer.shops[':slug'].products.$get({ param: { slug: shop } });
  return handleResponse(res);
});

type ApiCall = (...args: any) => Promise<any>;
type ApiResponse<T extends ApiCall> = Exclude<Awaited<ReturnType<T>>, string>;

export type Shop = ApiResponse<typeof getShop>;
export type Product = ApiResponse<typeof getProducts>[number];
