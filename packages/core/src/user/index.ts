import { and, eq } from "drizzle-orm";
import { db } from "../drizzle";
import { userTable } from "./user.sql";
import { z } from "zod";
import { fn } from "../util/fn";
import { createID } from "../util/id";
import { createTransaction } from "../drizzle/transaction";
import { useActor } from "../actor";
import { Shop } from "../shop";

export module User {
  export const Info = z.object({
    id: z.string(),
    email: z.string().email(),
    shopID: z.string(),
  });

  export const create = fn(Info.shape.email, async (email) => {
    const id = createID("user");
    await createTransaction((tx) =>
      tx.insert(userTable).values({
        id,
        email,
        shopID: Shop.use(),
      }),
    );
    return id;
  });

  export const fromID = fn(Info.shape.id, async (id) =>
    db
      .select()
      .from(userTable)
      .where(eq(userTable.id, id))
      .then((rows) => rows.map(serialize).at(0)),
  );

  export const fromEmail = fn(Info.shape.email, async (email) =>
    db
      .select()
      .from(userTable)
      .where(and(eq(userTable.email, email), eq(userTable.shopID, Shop.use())))
      .then((rows) => rows.map(serialize).at(0)),
  );

  export function use() {
    const actor = useActor();
    if (actor.type === "user") return actor.properties.userID;
    throw new Error(`Actor is "${actor.type}" not UserActor`);
  }

  function serialize(
    input: typeof userTable.$inferSelect,
  ): z.infer<typeof Info> {
    return {
      id: input.id,
      email: input.email,
      shopID: input.shopID,
    };
  }
}
