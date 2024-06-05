import { pgTable, text, uniqueIndex, varchar } from "drizzle-orm/pg-core";
import { id, timestamps } from "../drizzle/types";
import { shopIndexes } from "../shop/shop.sql";

export const collectionTable = pgTable(
  "collection",
  {
    ...id,
    ...timestamps,
    name: varchar("name", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull(),
    description: text("description"),
  },
  (table) => ({
    ...shopIndexes(table),
    slug: uniqueIndex().on(table.slug),
  }),
);
