import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { assertActor } from "@peasy-store/core/actor";
import { Body, NotFound, Result } from "../common";
import { HTTPException } from "hono/http-exception";
import { File } from "@peasy-store/core/file/index";

export module FilesApi {
  export const FileSchema = File.Info.openapi("File");

  export const route = new OpenAPIHono()
    .openapi(
      createRoute({
        method: "get",
        path: "/",
        responses: {
          404: NotFound("No files found"),
          200: Result(FileSchema.array(), "Returns shop's files"),
        },
      }),
      async (c) => {
        assertActor("user");
        const files = await File.list();
        if (!files) throw new HTTPException(404, { message: "No shops found" });
        return c.json({ result: files });
      },
    )
    .openapi(
      createRoute({
        method: "post",
        path: "/",
        request: Body(
          FileSchema.omit({ id: true, url: true, createdAt: true }),
        ),
        responses: {
          200: Result(
            FileSchema.extend({ uploadUrl: FileSchema.shape.url }),
            "Returns the newly created file and upload URL",
          ),
        },
      }),
      async (c) => {
        const body = c.req.valid("json");
        const result = await File.create(body);
        return c.json({ result }, 200);
      },
    );
}
