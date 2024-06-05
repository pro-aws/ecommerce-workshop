import { pgTable, uniqueIndex, varchar } from "drizzle-orm/pg-core";
import { id, timestamps } from "../drizzle/types";
import { shopIndexes } from "../shop/shop.sql";

export const userTable = pgTable(
  "user",
  {
    ...id,
    ...timestamps,
    email: varchar("email", { length: 255 }).notNull(),
  },
  (table) => ({
    ...shopIndexes(table),
    email: uniqueIndex().on(table.shopID, table.email),
  }),
);
