import { id, timestamps } from "../drizzle/types";
import { pgTable, uniqueIndex, varchar } from "drizzle-orm/pg-core";

// TODO: #6 This project is using Drizzle, which I highly recommend.
// You'll find a bunch of `.sql.ts` files throughout the `packages/core`
// directory. These are schema definitions for our tables. Not going to
// dive deep on this as it's out of scope for the workshop, but wanted to
// add a touch of commentary in case it's helpful.
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
