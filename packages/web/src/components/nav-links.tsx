"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavLinksProps extends React.HTMLAttributes<HTMLDivElement> {
  shopPath: string;
}

export function NavLinks({ shopPath }: NavLinksProps) {
  const pathname = usePathname();
  // const dashboard = `${shopPath}/dashboard`;
  // const orders = `${shopPath}/orders`;
  const products = `${shopPath}/products`;
  // const customers = `${shopPath}/customers`;
  // const analytics = `${shopPath}/analytics`;
  const settings = `${shopPath}/settings`;

  return (
    <>
      {/* <Link */}
      {/*   href={dashboard} */}
      {/*   className={cn( */}
      {/*     "text-muted-foreground transition-colors hover:text-foreground", */}
      {/*     pathname === dashboard && "text-foreground ", */}
      {/*   )} */}
      {/* > */}
      {/*   Dashboard */}
      {/* </Link> */}
      {/* <Link */}
      {/*   href={orders} */}
      {/*   className={cn( */}
      {/*     "text-muted-foreground transition-colors hover:text-foreground", */}
      {/*     pathname === orders && "text-foreground ", */}
      {/*   )} */}
      {/* > */}
      {/*   Orders */}
      {/* </Link> */}
      <Link
        href={products}
        className={cn(
          "text-muted-foreground transition-colors hover:text-foreground",
          pathname.startsWith(products) && "text-foreground ",
        )}
      >
        Products
      </Link>
      {/* <Link */}
      {/*   href={customers} */}
      {/*   className={cn( */}
      {/*     "text-muted-foreground transition-colors hover:text-foreground", */}
      {/*     pathname === customers && "text-foreground ", */}
      {/*   )} */}
      {/* > */}
      {/*   Customers */}
      {/* </Link> */}
      {/* <Link */}
      {/*   href={analytics} */}
      {/*   className={cn( */}
      {/*     "text-muted-foreground transition-colors hover:text-foreground", */}
      {/*     pathname === analytics && "text-foreground ", */}
      {/*   )} */}
      {/* > */}
      {/*   Analytics */}
      {/* </Link> */}
      <Link
        href={settings}
        className={cn(
          "text-muted-foreground transition-colors hover:text-foreground",
          pathname === settings && "text-foreground ",
        )}
      >
        Settings
      </Link>
    </>
  );
}
