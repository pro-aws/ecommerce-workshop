import { Metadata } from "next";
import Image from "next/image";
import { RocketIcon } from "@radix-ui/react-icons";
import { Alert, AlertDescription, AlertTitle } from "@/components/alert";

export const metadata: Metadata = {
  title: "Peasy",
  description: "Simple e-commerce.",
};

import logo from "../images/logos/peasy-mark.svg";
import { Resource } from "sst";

export default async function LandingPage() {
  // TODO: #8 Anytime we "link" a resource to another in SST,
  // it becomes available in the `Resource` object at runtime.
  // It'll always be named just as you named the component
  // (in this case, `ApiRouter`). Any given resource can expose
  // certain properties through this linking mechanism. `Router`
  // exposes it's URL, and we use that to call our API without
  // having to mess with environment variables. One of my favorite
  // features of SST.
  const message = await fetch(Resource.ApiRouter.url).then((r) => r.text());

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
              <Alert className="mt-5 text-left">
                <RocketIcon className="h-4 w-4" />
                <AlertTitle>From the API:</AlertTitle>
                <AlertDescription>
                  <code>{message}</code>
                </AlertDescription>
              </Alert>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
