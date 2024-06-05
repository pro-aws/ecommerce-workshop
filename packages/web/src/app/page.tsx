import Link from "next/link";
import { Metadata } from "next";
import Image from "next/image";

import { buttonVariants } from "@/components/button";
import Routes from "@/lib/routes";
import { cn } from "@/lib/utils";
import { Session } from "@/lib/session";

export const metadata: Metadata = {
  title: "Peasy",
  description: "Simple e-commerce.",
};

import logo from "../images/logos/peasy-mark.svg";

export default async function LandingPage() {
  const session = await Session.get();
  const email =
    session?.type === "account" ? session.properties.email : undefined;

  return (
    <div className="grid min-h-screen w-full">
      <div className="flex flex-col">
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm">
            <div className="flex flex-col items-center gap-1 text-center">
              <Image src={logo} alt="peasy logo" className="h-auto w-24 p-5" />
              <h1 className="text-2xl font-bold tracking-tight">
                This is a fake landing page
              </h1>
              <p className="text-sm text-muted-foreground">
                Imagine that you're being sold really hard on Peasy right now.
              </p>
              {email ? (
                <>
                  <p className="mt-4 text-muted-foreground">
                    Logged in as{" "}
                    <span className="text-foreground">{email}</span>
                  </p>
                  <a
                    href={Routes.signout}
                    className={cn(
                      buttonVariants({ variant: "default" }),
                      "mt-2 min-w-64",
                    )}
                  >
                    Signout
                  </a>
                </>
              ) : (
                <Link
                  href={Routes.signin}
                  className={cn(
                    buttonVariants({ variant: "default" }),
                    "mt-4 min-w-64",
                  )}
                >
                  Signin
                </Link>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
