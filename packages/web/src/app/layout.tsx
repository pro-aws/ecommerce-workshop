import { type Metadata } from "next";
import { Inter, Lexend } from "next/font/google";
import clsx from "clsx";

import "@/styles/tailwind.css";
import { Toaster } from "@/components/toaster";
import { TooltipProvider } from "@/components/tooltip";

export const metadata: Metadata = {
  title: {
    template: "%s - Peasy",
    default: "Peasy - Super simple e-commerce",
  },
  description: "The easiest e-commerce platform on the internet.",
};

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const lexend = Lexend({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-lexend",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={clsx(
        "h-full scroll-smooth bg-white antialiased ",
        inter.variable,
        lexend.variable,
      )}
    >
      <body className="flex h-full flex-col">
        <TooltipProvider>{children}</TooltipProvider>
        <Toaster />
      </body>
    </html>
  );
}
