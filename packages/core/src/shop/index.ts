import { and, eq, sql } from "drizzle-orm";
import { db } from "../drizzle";
import { shopTable } from "./shop.sql";
import { z } from "zod";
import { fn } from "../util/fn";
import { createID } from "../util/id";
import { createTransaction, getRowCount } from "../drizzle/transaction";
import { assertActor, useActor } from "../actor";
import { userTable } from "../user/user.sql";
import { HTTPException } from "hono/http-exception";

export module Shop {
  export class ShopExistsError extends HTTPException {
    constructor(slug: string) {
      super(400, { message: `There is already a shop named "${slug}"` });
    }
  }

  export const Info = z.object({
    id: z.string(),
    name: z.string().min(1, "Name is required"),
    slug: z
      .string()
      .min(3, "Must be at least 3 characters")
      .regex(/^[a-z0-9\-]+$/, "Must be lowercase, URL friendly"),
    active: z.boolean(),
  });

  export const create = fn(
    Info.pick({ name: true, slug: true }),
    async ({ name, slug }) => {
      const id = createID("shop");
      await createTransaction(async (tx) => {
        // TODO: #7 Here's an example of doing an INSERT into
        // the `shop` table. Pretty basic stuff! Just a reminder
        // that this code is running in a Lambda Function behind our
        // API Router. It's only allowed to hit our Aurora database
        // (through the Data API) because we linked the database
        // to our API earlier.
        //
        // As a fun exercise you could try removing the link from the
        // the API (in infra/api.ts), running `sst dev` and observing
        // what happens when you try to create a new shop from the web
        // frontend app!
        const result = await tx
          .insert(shopTable)
          .values({ id, name, slug, active: true })
          .onConflictDoNothing({ target: shopTable.slug });
        const rowCount = getRowCount(result);
        if (!rowCount) throw new ShopExistsError(slug);
      });
      return id;
    },
  );

  export const update = fn(
    Info.pick({ name: true, slug: true }),
    async ({ name, slug }) =>
      createTransaction(async (tx) => {
        const result = await tx
          .update(shopTable)
          .set({ name, slug, timeUpdated: sql`now()` })
          .where(and(eq(shopTable.id, Shop.use())))
          .returning()
          .then((rows) => rows.map(serialize).at(0));
        if (!result)
          throw new HTTPException(500, {
            message: "Something went wrong updating the shop",
          });
        return result;
      }),
  );

  export const remove = fn(Info.shape.id, async (id) => {
    await createTransaction(async (tx) => {
      const account = assertActor("account");
      const row = await tx
        .select({ shopID: userTable.shopID })
        .from(userTable)
        .where(
          and(
            eq(userTable.shopID, id),
            eq(userTable.email, account.properties.email),
          ),
        )
        .execute()
        .then((rows) => rows.at(0));
      if (!row) return; // account does not have access to this shop
      await tx
        .update(shopTable)
        .set({ timeDeleted: sql`now()` })
        .where(eq(shopTable.id, row.shopID));
    });
  });

  export const fromID = fn(Info.shape.id, async (id) =>
    db
      .select()
      .from(shopTable)
      .where(eq(shopTable.id, id))
      .then((rows) => rows.map(serialize).at(0)),
  );

  export const fromSlug = fn(Info.shape.slug, async (slug) =>
    db
      .select()
      .from(shopTable)
      .where(eq(shopTable.slug, slug))
      .then((rows) => rows.map(serialize).at(0)),
  );

  export function use() {
    const actor = useActor();
    if ("shopID" in actor.properties) return actor.properties.shopID;
    throw new Error(`Expected actor to have shopID`);
  }

  function serialize(
    input: typeof shopTable.$inferSelect,
  ): z.infer<typeof Info> {
    return {
      id: input.id,
      name: input.name,
      slug: input.slug,
      active: input.active,
    };
  }
}
