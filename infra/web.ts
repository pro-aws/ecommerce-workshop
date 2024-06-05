import { apiRouter } from "./api";
import { domain } from "./dns";

// TODO: #7 Now we need to create some hosting infrastructure.
// We'll use the `sst.aws.Nextjs` Component to deploy our
// (very basic) Next.js app. Go ahead and finish this definition
// noting that we'll need to point the `path` at our web package
// (`packages/web`), and don't forget our custom domain handling!
// This site should live at "www.<our domain>". Lastly, you'll need
// to "link" the `apiRouter` (imported above) to this web resource
// so that we can import the API URL on the frontend. More on that
// very soon.
//
// export const web = new sst.aws.Nextjs("WebApp", ...

export const outputs = {
  web: web.url,
};
