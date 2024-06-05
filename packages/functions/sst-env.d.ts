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
    WebApp: {
      type: "sst.aws.Nextjs"
      url: string
    }
  }
}
export {}