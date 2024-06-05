import {
  boolean,
  foreignKey,
  pgTable,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";
import { id, timestamps } from "../drizzle/types";

export const shopTable = pgTable(
  "shop",
  {
    id: id.id,
    ...timestamps,
    name: varchar("name", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull(),
    active: boolean("active").notNull().default(false),
  },
  (table) => ({
    slug: uniqueIndex().on(table.slug),
  }),
);

export function shopIndexes(table: any) {
  return {
    shop: foreignKey({
      foreignColumns: [shopTable.id],
      columns: [table.shopID],
    }),
  };
}
