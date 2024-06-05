import { and, eq, isNull, sql, desc } from "drizzle-orm";
import { db } from "../drizzle";
import { ImageMetadata, fileTable } from "./file.sql";
import { z } from "zod";
import { fn } from "../util/fn";
import { createID } from "../util/id";
import { useTransaction, createTransaction } from "../drizzle/transaction";
import { Resource } from "sst";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { Shop } from "../shop";
import { HTTPException } from "hono/http-exception";

const s3 = new S3Client({});

export module File {
  export const Info = z.object({
    id: z.string(),
    url: z.string().min(1),
    filename: z.string().min(1),
    contentType: z.string().min(1),
    createdAt: z.string(),
    altText: z.string().optional(),
    width: z.number().optional(),
    height: z.number().optional(),
  });

  export const create = fn(
    Info.omit({ id: true, createdAt: true, url: true }),
    (input) =>
      useTransaction(async (tx) => {
        const id = createID("file");
        const contentType = input.contentType;
        const filename = input.filename;
        const prefix =
          contentType.startsWith("image/") ||
          contentType.startsWith("audio/") ||
          contentType.startsWith("video/")
            ? "media"
            : undefined;
        const path = `${prefix ? prefix + "/" : ""}${id}/${filename}`;
        const uploadUrl = await getSignedUrl(
          s3,
          new PutObjectCommand({
            Bucket: Resource.CdnBucket.name,
            Key: path,
            ContentType: contentType,
          }),
        );

        const metadata: ImageMetadata = {
          type: "image",
          altText: input.altText,
          width: input.width,
          height: input.height,
        };

        const result = await tx
          .insert(fileTable)
          .values({
            id,
            shopID: Shop.use(),
            uploadUrl,
            path,
            filename,
            contentType,
            metadata,
          })
          .returning()
          .then((rows) => rows.map(serialize).at(0));
        if (!result)
          throw new HTTPException(404, { message: "Failed to create file" });

        return { ...result, uploadUrl };
      }),
  );

  export const remove = fn(Info.shape.id, async (id) => {
    await createTransaction(async (tx) =>
      tx
        .update(fileTable)
        .set({ timeDeleted: sql`now()` })
        .where(eq(fileTable.id, id)),
    );
  });

  export function list() {
    return useTransaction(async (tx) =>
      tx
        .select()
        .from(fileTable)
        .where(
          and(eq(fileTable.shopID, Shop.use()), isNull(fileTable.timeDeleted)),
        )
        .orderBy(desc(fileTable.timeCreated))
        .then((rows) => rows.map(serialize)),
    );
  }

  export const fromID = fn(Info.shape.id, async (id) =>
    db
      .select()
      .from(fileTable)
      .where(eq(fileTable.id, id))
      .then((rows) => rows.map(serialize).at(0)),
  );

  export function serialize(
    input: typeof fileTable.$inferSelect,
  ): z.infer<typeof Info> {
    return {
      id: input.id,
      url: `${Resource.CdnRouter.url}/${input.path}`,
      filename: input.filename,
      contentType: input.contentType,
      createdAt: input.timeCreated.toISOString(),
      altText: input.metadata?.altText,
      width: input.metadata?.width,
      height: input.metadata?.height,
    };
  }
}
