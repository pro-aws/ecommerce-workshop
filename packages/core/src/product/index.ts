import { and, eq, desc, sql, isNull } from "drizzle-orm";
import { productTable, productsToFilesTable } from "./product.sql";
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
import { fileTable } from "../file/file.sql";
import { File } from "../file";
import { shopTable } from "../shop/shop.sql";

// SOLUTION: #2 Installed the Bedrock SDK and instantiated
// the BedrockRuntimeClient.
import {
  BedrockRuntimeClient,
  InvokeModelCommand,
  type InvokeModelCommandInput,
} from "@aws-sdk/client-bedrock-runtime";
const client = new BedrockRuntimeClient({});

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

  export const Image = z.object({
    id: z.string(),
    url: z.string(),
    altText: z.string().optional(),
    width: z.number().optional(),
    height: z.number().optional(),
  });

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
    images: Image.array().optional(),
    createdAt: z.string(),
  });

  export type Info = z.infer<typeof Info>;

  export const create = fn(
    Info.pick({
      name: true,
      description: true,
      price: true,
      status: true,
    }).extend({
      images: z.string().array().optional(),
    }),
    async ({ name, description, price, status, images }) => {
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
            availableForSale: status === "active",
            price,
          })
          .onConflictDoNothing({
            target: [productTable.shopID, productTable.slug],
          });
        const rowCount = getRowCount(result);
        if (!rowCount) throw new ProductExistsError(slug);
        await updateImages({ id, images });
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
    }).extend({ images: z.string().array().optional() }),
    async (input) => {
      const { id, status, images, ...rest } = input;
      await useTransaction(async (tx) => {
        await updateImages({ id, images });
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
      .innerJoin(shopTable, eq(productTable.shopID, shopTable.id))
      .leftJoin(
        productsToFilesTable,
        eq(productTable.id, productsToFilesTable.productID),
      )
      .leftJoin(fileTable, eq(productsToFilesTable.fileID, fileTable.id));

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

  export const updateImages = fn(
    Info.pick({ id: true }).extend({ images: z.string().array().optional() }),
    (input) =>
      useTransaction(async (tx) => {
        await tx
          .delete(productsToFilesTable)
          .where(eq(productsToFilesTable.productID, input.id));
        if (input.images?.length) {
          await tx
            .insert(productsToFilesTable)
            .values(
              input.images.map((fileID) => ({ productID: input.id, fileID })),
            );
        }
      }),
  );

  export const generateDescription = fn(
    Info.pick({
      name: true,
      description: true,
      price: true,
    })
      .partial({ name: true, description: true, price: true })
      .extend({
        prompt: z.string(),
        tone: z.string(),
      }),
    async (input) => {
      const content = `
You are a product marketing expert.
You are tasked with writing a product description for a product with the below metadata (may be incomplete).

Name: ${input.name}
Current Description: ${input.description}
Price: ${input.price ? "$" + (input.price / 100).toFixed(2) : ""}

The user provided the following prompt providing additional detail about the product: "${input.prompt}".
The product description should have a ${input.tone} tone.
Don't actually include the product price in the generated description, I just wanted you to have it for context.
Keep the generated description to a maximum of 2-3 sentences.

It is critical that your response contains ONLY the suggested product description, no other explanation, no outer quotation marks.`.trim();

      // SOLUTION: #1 Send an `InvokeModelCommand` to Bedrock
      // with the appropriate body for Claude v3 Haiku.
      console.log("Generating description with:", content);

      const commandInput: InvokeModelCommandInput = {
        body: JSON.stringify({
          max_tokens: 1024,
          messages: [{ role: "user", content }],
          anthropic_version: "bedrock-2023-05-31",
        }),
        contentType: "application/json",
        modelId: "anthropic.claude-3-haiku-20240307-v1:0", // 'anthropic.claude-3-sonnet-20240229-v1:0',
      };

      const command = new InvokeModelCommand(commandInput);
      const raw = await client.send(command);
      const completions = JSON.parse(Buffer.from(raw.body).toString()) as {
        id: string;
        type: string;
        role: string;
        content: [{ type: string; text: string }];
        model: string;
        stop_reason: string;
        stop_sequence: string | null;
        usage: { input_tokens: number; output_tokens: number };
      };
      const description = completions.content[0].text;
      console.log("Generated description", description);

      return description.trim();
    },
  );

  function serialize(
    group: {
      product: typeof productTable.$inferSelect;
      file: typeof fileTable.$inferSelect | null;
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
      images: group
        .filter((item) => item.file)
        .map((item) => ({ ...File.serialize(item.file!) })),
    };
  }
}
