import Routes from "@/lib/routes";
import { Product, getProduct } from "@/app/actions";
import { ProductForm } from "./product-form";
import { notFound } from "next/navigation";

export default async function NewProductPage({
  params,
}: {
  params: { shop: string; product: string };
}) {
  const product =
    params.product === "new"
      ? ({ status: "draft" } as Product)
      : await getProduct(params.product);
  if (typeof product === "string") return notFound();

  return (
    <ProductForm
      mode={params.product === "new" ? "create" : "update"}
      product={product}
      backHref={await Routes.shop.products.index(params.shop)}
    />
  );
}
