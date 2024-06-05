import { CircleUser, Menu } from "lucide-react";

import { Button } from "@/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/sheet";
import Routes from "@/lib/routes";
import { NavLinks } from "@/components/nav-links";
import { ShopSwitcher } from "@/components/shop-switcher";
import { getAccount } from "@/app/actions";
import { notFound, redirect } from "next/navigation";

export default async function ShopLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { shop: string };
}) {
  const slug = params.shop;
  const account = await getAccount();
  if (typeof account === "string") return redirect(Routes.signin);
  if (!account.shops?.length) return redirect(Routes.shop.new);
  if (!account.shops?.find((shop) => shop.slug === slug)) return notFound();

  const shopPath = await Routes.shop.index(slug);

  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0  flex min-h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
          <ShopSwitcher shops={account.shops} />
          <NavLinks shopPath={shopPath} />
        </nav>
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="shrink-0 md:hidden"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <nav className="grid gap-6 text-lg font-medium">
              <ShopSwitcher shops={account.shops} />
              <NavLinks shopPath={shopPath} />
            </nav>
          </SheetContent>
        </Sheet>
        <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
          <div className="ml-auto flex-1 sm:flex-initial" />
          {/* <form className="ml-auto flex-1 sm:flex-initial"> */}
          {/*   <div className="relative"> */}
          {/*     <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" /> */}
          {/*     <Input */}
          {/*       type="search" */}
          {/*       placeholder="Search products..." */}
          {/*       className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px]" */}
          {/*     /> */}
          {/*   </div> */}
          {/* </form> */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="rounded-full">
                <CircleUser className="h-5 w-5" />
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuItem>Support</DropdownMenuItem>
              <DropdownMenuSeparator />
              <a href={Routes.signout}>
                <DropdownMenuItem>Signout</DropdownMenuItem>
              </a>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        {children}
      </main>
    </div>
  );
}
