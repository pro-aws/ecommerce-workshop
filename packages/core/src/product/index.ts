import { and, eq, desc, sql, isNull } from "drizzle-orm";
import { productTable } from "./product.sql";
import { z } from "zod";
import { fn } from "../util/fn";
import { createID, createSlug } from "../util/id";
import {
  useTransaction,
  createTransaction,
  createTransactionEffect,
  TxOrDb,
  getRowCount,
} from "../drizzle/transaction";
import { HTTPException } from "hono/http-exception";
import { map, pipe, values, groupBy, first } from "remeda";
import { event } from "../event";
import { bus } from "sst/aws/bus";
import { Resource } from "sst";
import { Shop } from "../shop";
import { shopTable } from "../shop/shop.sql";

export module Product {
  export class ProductExistsError extends HTTPException {
    constructor(slug: string) {
      super(400, { message: `There is already a product named "${slug}"` });
    }
  }

  export const Events = {
    Created: event(
      "product.created",
      z.object({
        shopID: z.string().min(1),
        productID: z.string().min(1),
      }),
    ),
  };

  export const Info = z.object({
    id: z.string(),
    name: z.string().min(1),
    description: z.string().optional(),
    price: z.number(),
    slug: z
      .string()
      .min(3, "Must be at least 3 characters")
      .regex(/^[a-z0-9\-]+$/, "Must be lowercase, URL friendly."),
    status: z.enum(["draft", "active", "archived"]),
    createdAt: z.string(),
  });

  export type Info = z.infer<typeof Info>;

  export const create = fn(
    Info.pick({ name: true, description: true, price: true, status: true }),
    async ({ name, description, price, status }) => {
      const id = createID("product");
      const slug = createSlug(name);
      const shopID = Shop.use();
      await createTransaction(async (tx) => {
        const result = await tx
          .insert(productTable)
          .values({
            id,
            shopID,
            name,
            description,
            slug,
            price,
            availableForSale: status === "active",
          })
          .onConflictDoNothing({
            target: [productTable.shopID, productTable.slug],
          });
        const rowCount = getRowCount(result);
        if (!rowCount) throw new ProductExistsError(slug);
        await createTransactionEffect(() =>
          bus.publish(Resource.Bus, Events.Created, {
            shopID,
            productID: id,
          }),
        );
      });
      return { id, slug };
    },
  );

  export const update = fn(
    Info.pick({
      id: true,
      name: true,
      description: true,
      price: true,
      status: true,
    }),
    async (input) => {
      const { id, status, ...rest } = input;
      await useTransaction(async (tx) => {
        return tx
          .update(productTable)
          .set({
            ...rest,
            slug: createSlug(rest.name),
            availableForSale: status === "active",
            timeDeleted: status === "archived" ? sql`now()` : null,
            timeUpdated: sql`now()`,
          })
          .where(
            and(eq(productTable.shopID, Shop.use()), eq(productTable.id, id)),
          );
      });
    },
  );

  export const remove = fn(Info.shape.id, async (id) => {
    await createTransaction(async (tx) =>
      tx
        .update(productTable)
        .set({ availableForSale: false, timeDeleted: sql`now()` })
        .where(
          and(eq(productTable.shopID, Shop.use()), eq(productTable.id, id)),
        ),
    );
  });

  const selectBase = (tx: TxOrDb) =>
    tx
      .select()
      .from(productTable)
      .innerJoin(shopTable, eq(productTable.shopID, shopTable.id));

  export const fromShopID = fn(Shop.Info.shape.id, (id) =>
    useTransaction(async (tx) => {
      const rows = await selectBase(tx)
        .where(eq(productTable.shopID, id))
        .orderBy(desc(productTable.timeUpdated));
      const result = pipe(
        rows,
        groupBy((x) => x.product.id),
        values,
        map(serialize),
      );
      return result;
    }),
  );

  export const fromShopSlug = fn(Shop.Info.shape.slug, (slug) =>
    useTransaction(async (tx) => {
      const rows = await selectBase(tx)
        .where(
          and(
            eq(shopTable.slug, slug),
            eq(productTable.availableForSale, true),
            isNull(productTable.timeDeleted),
          ),
        )
        .orderBy(desc(productTable.timeUpdated));
      const result = pipe(
        rows,
        groupBy((x) => x.product.id),
        values,
        map(serialize),
      );
      return result;
    }),
  );

  export const list = () => fromShopID(Shop.use());

  export const fromID = fn(Info.shape.id, (id) =>
    useTransaction(async (tx) => {
      const rows = await selectBase(tx).where(eq(productTable.id, id));
      const result = pipe(
        rows,
        groupBy((x) => x.product.id),
        values,
        map(serialize),
        first(),
      );
      return result;
    }),
  );

  export const fromSlug = fn(Info.shape.slug, (slug) =>
    useTransaction(async (tx) => {
      const rows = await selectBase(tx).where(
        and(eq(productTable.slug, slug), eq(productTable.shopID, Shop.use())),
      );
      const result = pipe(
        rows,
        groupBy((x) => x.product.id),
        values,
        map(serialize),
        first(),
      );
      return result;
    }),
  );

  function serialize(
    group: {
      product: typeof productTable.$inferSelect;
    }[],
  ): z.infer<typeof Info> {
    const product = group[0].product;
    return {
      id: product.id,
      name: product.name,
      description: product.description || undefined,
      price: product.price,
      slug: product.slug,
      status: product.availableForSale
        ? "active"
        : product.timeDeleted
          ? "archived"
          : "draft",
      createdAt: product.timeCreated.toISOString(),
    };
  }
}
