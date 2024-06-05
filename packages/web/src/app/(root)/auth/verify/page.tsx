import { Metadata } from "next";
import Link from "next/link";

import { VerifyForm } from "./verify-form";
import { Resource } from "sst";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Verify Email",
  description: "Verify your email address to sign in to Peasy",
};

export default function AuthenticationPage() {
  return (
    <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Verify email address
        </h1>
        <p className="text-sm text-muted-foreground">
          Enter the 6-digit code we sent to your email address.
        </p>
      </div>
      <Suspense>
        <VerifyForm authUrl={Resource.AuthRouter.url} />
      </Suspense>
      <p className="px-8 text-center text-sm text-muted-foreground">
        By clicking continue, you agree to our{" "}
        <Link
          href="/terms"
          className="underline underline-offset-4 hover:text-primary"
        >
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link
          href="/privacy"
          className="underline underline-offset-4 hover:text-primary"
        >
          Privacy Policy
        </Link>
        .
      </p>
    </div>
  );
}
