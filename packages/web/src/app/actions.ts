"use server";

import { cache } from "react";
import { client, handleResponse } from "@/lib/api";
import { redirect } from "next/navigation";
import { Resource } from "sst";
import { headers } from "next/headers";

// TODO: #19 I wanted to also show you the frontend side
// of things real quick. As you can see, we redirect to
// the `authRouter.url` `/code/authorize` endpoint to kick
// off the flow. There's a lot you can sift through here
// and I won't hold your hand through all of it, but I do
// want to point out that the `provider` matches up with
// the provider we defined in our auth handler (`code`).
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
