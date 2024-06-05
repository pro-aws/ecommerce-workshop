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
    });
    const outputs = {};
    for (const value of readdirSync("./infra/")) {
      const result = await import("./infra/" + value);
      if (result.outputs) Object.assign(outputs, result.outputs);
    }
    return outputs;
  },
});
