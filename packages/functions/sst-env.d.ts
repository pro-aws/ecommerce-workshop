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
    Bus: {
      name: string
      type: "sst.aws.Bus"
    }
    CdnBucket: {
      name: string
      type: "sst.aws.Bucket"
    }
    CdnRouter: {
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
    StripeAnnualPrice: {
      id: string
      type: "stripe.index/price.Price"
      unitAmount: number
    }
    StripeConnectWebhook: {
      secret: string
      type: "stripe.index/webhookEndpoint.WebhookEndpoint"
    }
    StripeMonthlyPrice: {
      id: string
      type: "stripe.index/price.Price"
      unitAmount: number
    }
    StripeProduct: {
      id: string
      name: string
      type: "stripe.index/product.Product"
    }
    StripeSecret: {
      type: "sst.sst.Secret"
      value: string
    }
    StripeWebhook: {
      secret: string
      type: "stripe.index/webhookEndpoint.WebhookEndpoint"
    }
    WebApp: {
      type: "sst.aws.Nextjs"
      url: string
    }
  }
}
export {}