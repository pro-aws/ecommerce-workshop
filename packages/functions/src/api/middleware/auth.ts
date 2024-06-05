import { MiddlewareHandler } from "hono";
import { HTTPException } from "hono/http-exception";
import { Actor, withActor } from "@peasy-store/core/actor";
import { Account } from "@peasy-store/core/account/index";
import { sessions } from "../../sessions";
import { Shop } from "@peasy-store/core/shop/index";

export const AuthMiddleware: MiddlewareHandler = async (c, next) => {
  const authorization = c.req.header("authorization");
  if (!authorization)
    throw new HTTPException(403, {
      message: "Authorization header is required.",
    });
  const token = authorization.split(" ")[1];
  if (!token)
    throw new HTTPException(403, {
      message: "Bearer token is required.",
    });

  let actor: Actor = await sessions.verify(token);
  if (actor.type === "account") {
    const accountActor = actor; // helps TypeScript infer through the callback below
    const slug = c.req.header("x-peasy-shop");
    if (slug) {
      const shop = await Shop.fromSlug(slug);
      const shopID = shop?.id;
      if (shopID) {
        await withActor(accountActor, async () => {
          const user = await Account.user(shopID);
          if (!user)
            throw new HTTPException(403, {
              message: "You do not have access to this shop.",
            });
          actor = {
            type: "user",
            properties: {
              ...accountActor.properties,
              userID: user.id,
              shopID,
            },
          };
        });
      }
    }
  }
  await withActor(actor, next);
};
