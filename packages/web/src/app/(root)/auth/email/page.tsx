import { Metadata } from "next";
import Link from "next/link";
import { EmailForm } from "./email-form";
import { Session } from "@/lib/session";
import { redirect } from "next/navigation";
import Routes from "@/lib/routes";

export const metadata: Metadata = {
  title: "Create an account",
  description: "Create an account to start selling your stuff on Peasy.",
};

export default async function EmailPage() {
  const session = await Session.get();
  if (session && session.type === "account") return redirect(Routes.home);

  return (
    <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
      <div className="flex flex-col gap-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Create an account
        </h1>
        <p className="text-sm text-muted-foreground">
          Enter your email below to create your account
        </p>
      </div>
      <EmailForm />
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
