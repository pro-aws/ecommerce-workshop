/* tslint:disable */
/* eslint-disable */
import "sst"
declare module "sst" {
  export interface Resource {
    Api: {
      name: string
      type: "sst.aws.Function"
      url: string
    }
    ApiRouter: {
      type: "sst.aws.Router"
      url: string
    }
    Auth: {
      publicKey: string
      type: "sst.aws.Auth"
    }
    AuthAuthenticator: {
      name: string
      type: "sst.aws.Function"
      url: string
    }
    AuthRouter: {
      type: "sst.aws.Router"
      url: string
    }
    Database: {
      clusterArn: string
      database: string
      secretArn: string
      type: "sst.aws.Postgres"
    }
    Email: {
      sender: string
      type: "sst.aws.Email"
    }
    Store: {
      type: "sst.aws.Nextjs"
      url: string
    }
    WebApp: {
      type: "sst.aws.Nextjs"
      url: string
    }
  }
}
export {}