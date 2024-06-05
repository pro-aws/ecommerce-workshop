import Link from "next/link";
import { Metadata } from "next";

import { buttonVariants } from "@/components/button";
import { cn } from "@/lib/utils";
import Image from "next/image";
import logo from "../images/logos/peasy-mark.svg";

export const metadata: Metadata = {
  title: "Page Not Found",
  description: "Simple e-commerce.",
};

export default function NotFoundPage() {
  return (
    <div className="grid min-h-screen w-full">
      <div className="flex flex-col">
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm">
            <div className="flex flex-col items-center gap-1 text-center">
              <Image src={logo} alt="peasy logo" className="h-auto w-24 p-5" />
              <h1 className="text-2xl font-bold tracking-tight">
                There's nothing here
              </h1>
              <p className="text-sm text-muted-foreground">
                Seriously, we looked everywhere. It's just not here.
              </p>
              <Link
                href="/"
                className={cn(
                  buttonVariants({ variant: "default" }),
                  "mt-4 min-w-64",
                )}
              >
                Go Home
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

