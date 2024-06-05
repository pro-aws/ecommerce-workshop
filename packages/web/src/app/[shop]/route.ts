import Routes from "@/lib/routes";
import { redirect } from "next/navigation";
import { NextRequest } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: { shop: string } },
) {
  // For now, redirect shop root to /products
  return redirect(await Routes.shop.products.index(params.shop));
}
