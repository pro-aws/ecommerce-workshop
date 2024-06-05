/// <reference path="./.sst/platform/config.d.ts" />
import { readdirSync } from "fs";

export default $config({
  app(input) {
    return {
      name: "peasy-store",
      removal: input?.stage === "production" ? "retain" : "remove",
      home: "aws",
      providers: {
        aws: {
          region: "us-east-1",
          profile:
            input.stage === "production" ? "proaws-production" : "proaws-dev",
        },
      },
    };
  },
  async run() {
    $transform(sst.aws.Function, (args) => {
      args.environment = $resolve([args.environment]).apply(([environment]) => {
        return {
          ...environment,
          NODE_OPTIONS: "--experimental-websocket",
        };
      });
      args.permissions = $resolve([args.permissions]).apply(([permissions]) => {
        return [
          ...(permissions || []),
          // TODO: #20 Just wanted you to get a peek of this wonky looking code
          // to understand that we have to provide our Lambda Functions with
          // IAM permissions to send email. I'm giving all of our functions
          // `ses:*` on all resources (`*`), but you could get more specific here.
          // If you want to feel something, comment the below line out and then
          // try going through the auth flow to see what happens.
          { actions: ["ses:*"], resources: ["*"] },
        ];
      });
    });
    const outputs = {};
    for (const value of readdirSync("./infra/")) {
      const result = await import("./infra/" + value);
      if (result.outputs) Object.assign(outputs, result.outputs);
    }
    return outputs;
  },
});
