import { z } from "@hono/zod-openapi";

export function Body<T extends z.ZodTypeAny>(schema: T, description?: string) {
  return {
    body: {
      content: {
        "application/json": {
          schema,
        },
      },
      description,
    },
  };
}

export function Result<T extends z.ZodTypeAny>(schema: T, description: string) {
  return {
    content: {
      "application/json": {
        schema: z.object({
          result: schema,
        }),
      },
    },
    description,
  };
}

export function NotFound(description: string) {
  return {
    content: {
      "application/json": { schema: z.object({ error: z.string() }) },
    },
    description,
  };
}
