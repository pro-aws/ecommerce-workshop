import { MiddlewareHandler } from "hono";
import { HTTPException } from "hono/http-exception";
import { withActor } from "@peasy-store/core/actor";
import { sessions } from "../../sessions";

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

  const actor = await sessions.verify(token);
  await withActor(actor, next);
};
