"use server";

import { cache } from "react";
import { client, handleResponse } from "@/lib/api";
import { redirect } from "next/navigation";
import { Resource } from "sst";
import { headers } from "next/headers";

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

type ApiCall = (...args: any) => Promise<any>;
type ApiResponse<T extends ApiCall> = Exclude<Awaited<ReturnType<T>>, string>;

export type Account = ApiResponse<typeof getAccount>;
