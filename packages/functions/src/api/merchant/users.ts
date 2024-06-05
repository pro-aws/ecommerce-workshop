import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { User } from "@peasy-store/core/user/index";
import { NotFound, Result } from "../common";

export module UsersApi {
  export const UserSchema = User.Info.openapi("User");

  export const route = new OpenAPIHono().openapi(
    createRoute({
      method: "get",
      path: "/me",
      responses: {
        404: NotFound("User not found"),
        200: Result(UserSchema, "Returns user"),
      },
    }),
    async (c) => {
      const result = await User.fromID(User.use());
      if (!result) return c.json({ error: "User not found" }, 404);
      return c.json({ result }, 200);
    },
  );
}
