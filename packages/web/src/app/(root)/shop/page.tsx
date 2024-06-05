import { Metadata } from "next";
import { ShopForm } from "./shop-form";
import { getAccount } from "@/app/actions";
import { redirect } from "next/navigation";
import Routes from "@/lib/routes";

export const metadata: Metadata = {
  title: "Create a new shop",
  description: "Create a new shop to start selling on Peasy.",
};

export default async function ShopPage() {
  const account = await getAccount();
  if (typeof account === "string") return redirect(Routes.signin);

  return (
    <div className="mx-auto flex w-full flex-col justify-center gap-6 sm:w-[350px]">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Create a shop</h1>
        <p className="text-sm text-muted-foreground">
          Start by giving your shop a name
        </p>
      </div>
      <ShopForm />
    </div>
  );
}
