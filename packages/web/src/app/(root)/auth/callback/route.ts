import { getAccount } from "@/app/actions";
import Routes from "@/lib/routes";
import { Session } from "@/lib/session";
import { redirect } from "next/navigation";
import { NextRequest } from "next/server";
import { Resource } from "sst";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  if (!code) return redirect(Routes.home);

  const response = await fetch(Resource.AuthRouter.url + "/token", {
    method: "POST",
    headers: { Accept: "application/json" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      client_id: "web",
      code,
      redirect_uri: `${request.nextUrl.origin}${request.nextUrl.pathname}`,
    }),
  });

  type TokenResponse = { access_token: string };
  let json: Record<string, unknown>;
  let tokenResponse: TokenResponse;
  try {
    json = (await response.json()) as Record<string, unknown>;
    if ("body" in json)
      tokenResponse = JSON.parse(json.body as string) as TokenResponse;
    else tokenResponse = json as TokenResponse;
  } catch (e) {
    console.error(e);
    return redirect(Routes.home);
  }

  const token = tokenResponse.access_token;
  if (!token) return redirect(Routes.home);

  Session.set(token);

  const account = await getAccount();
  if (typeof account === "string") return redirect(Routes.home);

  return redirect(Routes.home);
}
