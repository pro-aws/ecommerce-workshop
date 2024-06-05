import Routes from "@/lib/routes";
import { Session } from "@/lib/session";
import { redirect } from "next/navigation";
import { NextRequest } from "next/server";

export async function GET(_request: NextRequest) {
  Session.clear();
  return redirect(Routes.home);
}
