import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const shop = request.nextUrl.pathname.split("/")[1];
  const response = NextResponse.next();
  response.headers.set("x-peasy-shop", shop);
  return response;
}

export const config = {
  matcher: "/((?!api|static|.*\\..*|_next|auth|shop).+)",
};
