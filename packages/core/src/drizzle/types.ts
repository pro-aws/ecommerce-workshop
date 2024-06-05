import { timestamp as rawTs, bigint, varchar } from "drizzle-orm/pg-core";

export const uuid = (name: string) => varchar(name, { length: 20 });

export const id = {
  get id() {
    return uuid("id").primaryKey();
  },
  get shopID() {
    return uuid("shop_id").notNull();
  },
};

export const timestamp = (name: string) =>
  rawTs(name, { precision: 3, mode: "date" });

export const dollar = (name: string) => bigint(name, { mode: "number" });

export const timestamps = {
  timeCreated: timestamp("time_created").notNull().defaultNow(),
  timeUpdated: timestamp("time_updated").notNull().defaultNow(),
  timeDeleted: timestamp("time_deleted"),
};
