import { Logo, Mark } from "@/components/logo";
import Routes from "@/lib/routes";
import Link from "next/link";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="container relative grid h-full flex-col items-center justify-center lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
        <div className="absolute inset-0 bg-zinc-900" />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <Link href={await Routes.shop.index()}>
            <Logo className="w-36 text-white" />
          </Link>
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              &ldquo;Peasy is so easy to use I sold a million zillion dollars
              worth of stuff to people over the internet in my first
              month.&rdquo;
            </p>
            <footer className="text-sm">Sam Person</footer>
          </blockquote>
        </div>
      </div>
      <div className="lg:p-8">
        <Link href={await Routes.shop.index()}>
          <Mark className="mx-auto w-14 pb-4 lg:hidden" />
        </Link>
        {children}
      </div>
    </div>
  );
}
