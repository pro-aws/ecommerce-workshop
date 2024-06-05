import {
  boolean,
  foreignKey,
  pgTable,
  primaryKey,
  text,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";
import { dollar, id, timestamps, uuid } from "../drizzle/types";
import { shopIndexes } from "../shop/shop.sql";
import { collectionTable } from "../collection/collection.sql";

export const productTable = pgTable(
  "product",
  {
    ...id,
    ...timestamps,
    name: varchar("name", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull(),
    description: text("description"),
    availableForSale: boolean("available_for_sale").notNull().default(false),
    price: dollar("price").notNull(),
  },
  (table) => ({
    ...shopIndexes(table),
    slug: uniqueIndex().on(table.shopID, table.slug),
  }),
);

export const productsToCollectionsTable = pgTable(
  "products_to_collections",
  {
    ...timestamps,
    productID: uuid("product_id")
      .notNull()
      .references(() => productTable.id),
    collectionID: uuid("collection_id")
      .notNull()
      .references(() => collectionTable.id),
  },
  (table) => ({
    primary: primaryKey({ columns: [table.productID, table.collectionID] }),
    product: foreignKey({
      foreignColumns: [productTable.id],
      columns: [table.productID],
    }),
    collection: foreignKey({
      foreignColumns: [collectionTable.id],
      columns: [table.collectionID],
    }),
  }),
);
