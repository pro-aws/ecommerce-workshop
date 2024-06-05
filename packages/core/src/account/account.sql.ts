import { id, timestamps } from "../drizzle/types";
import { pgTable, uniqueIndex, varchar } from "drizzle-orm/pg-core";

export const accountTable = pgTable(
  "account",
  {
    id: id.id,
    email: varchar("email", { length: 255 }).notNull(),
    ...timestamps,
  },
  (table) => ({
    email: uniqueIndex().on(table.email),
  }),
);
