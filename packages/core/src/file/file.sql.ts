import { jsonb, pgTable, text, varchar } from "drizzle-orm/pg-core";
import { id, timestamps } from "../drizzle/types";
import { shopIndexes } from "../shop/shop.sql";

export type ImageMetadata = {
  type: "image";
  width?: number;
  height?: number;
  altText?: string;
};
export type FileMetadata = ImageMetadata;

export const fileTable = pgTable(
  "file",
  {
    ...id,
    ...timestamps,
    path: text("path").notNull(),
    filename: text("filename").notNull(),
    contentType: varchar("content_type", { length: 255 }).notNull(),
    uploadUrl: text("upload_url").notNull(),
    metadata: jsonb("metadata").$type<FileMetadata>(),
  },
  (table) => ({
    ...shopIndexes(table),
  }),
);
