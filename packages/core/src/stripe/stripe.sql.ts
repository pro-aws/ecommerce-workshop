import { pgTable, text, varchar } from "drizzle-orm/pg-core";
import { id, timestamps } from "../drizzle/types";
import { shopIndexes, shopTable } from "../shop/shop.sql";

export const Standing = ["new", "good", "overdue"] as const;

export const stripeTable = pgTable(
  "stripe",
  {
    shopID: id.shopID.primaryKey().references(() => shopTable.id),
    ...timestamps,
    customerID: varchar("customer_id", { length: 255 }).notNull(),
    subscriptionID: varchar("subscription_id", { length: 255 }),
    subscriptionItemID: varchar("subscription_item_id", {
      length: 255,
    }),
    standing: text("standing", { enum: Standing }).notNull(),
  },
  (table) => ({
    ...shopIndexes(table),
  }),
);
