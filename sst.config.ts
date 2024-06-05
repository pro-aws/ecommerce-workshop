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
        "pulumi-stripe": true,
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
          { actions: ["ses:*"], resources: ["*"] },
          // SOLUTION: #3 Added bedrock permissions
          { actions: ["bedrock:InvokeModel"], resources: ["*"] },
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
