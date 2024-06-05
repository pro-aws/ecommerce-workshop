import { eq, and, getTableColumns } from "drizzle-orm";
import { db } from "../drizzle";
import { accountTable } from "./account.sql";
import { z } from "zod";
import { fn } from "../util/fn";
import { createID } from "../util/id";
import {
  createTransactionEffect,
  useTransaction,
} from "../drizzle/transaction";
import { userTable } from "../user/user.sql";
import { shopTable } from "../shop/shop.sql";
import { assertActor, useActor } from "../actor";
import { event } from "../event";
import { bus } from "sst/aws/bus";
import { Resource } from "sst";
import { SESv2Client, SendEmailCommand } from "@aws-sdk/client-sesv2";
import { Shop } from "../shop";

const ses = new SESv2Client({});

export module Account {
  export const Info = z.object({
    id: z.string(),
    email: z.string().email(),
    shops: Shop.Info.pick({ id: true, name: true, slug: true, active: true })
      .array()
      .optional(),
  });

  export const Events = {
    Created: event(
      "account.created",
      z.object({
        id: Account.Info.shape.id,
        email: Account.Info.shape.email,
      }),
    ),
  };

  export const create = fn(Info.shape.email, async (email) => {
    return useTransaction(async (tx) => {
      const id = createID("account");
      await tx.insert(accountTable).values({ id, email });
      await createTransactionEffect(() =>
        // SOLUTION: #8 We publish the event to the bus, providing
        // the bus information from `Resource.Bus`. We also pass
        // in our event defined above as well as the `id` and `email`.
        bus.publish(Resource.Bus, Events.Created, { id, email }),
      );
      return id;
    });
  });

  export const fromID = fn(Info.shape.id, async (id) =>
    db
      .select()
      .from(accountTable)
      .where(eq(accountTable.id, id))
      .then((rows) => rows.map(serialize).at(0)),
  );

  export const fromEmail = fn(Info.shape.email, async (email) =>
    db
      .select()
      .from(accountTable)
      .where(eq(accountTable.email, email))
      .then((rows) => rows.map(serialize).at(0)),
  );

  export function shops() {
    return useTransaction((tx) =>
      tx
        .select({
          shopID: shopTable.id,
          name: shopTable.name,
          slug: shopTable.slug,
          active: shopTable.active,
        })
        .from(userTable)
        .innerJoin(shopTable, eq(userTable.shopID, shopTable.id))
        .where(
          and(
            eq(userTable.email, assertActor("account").properties.email),
            eq(shopTable.active, true),
          ),
        )
        .orderBy(shopTable.id)
        .then((rows) =>
          rows.map((row) => ({
            id: row.shopID,
            name: row.name,
            slug: row.slug,
            active: row.active,
          })),
        ),
    );
  }

  export async function shop() {
    return shops().then((shops) => shops[0]);
  }

  export const user = fn(Shop.Info.shape.id, (shopID) =>
    useTransaction((tx) =>
      tx
        .select(getTableColumns(userTable))
        .from(userTable)
        .where(
          and(
            eq(userTable.email, assertActor("account").properties.email),
            eq(userTable.shopID, shopID),
          ),
        )
        .execute()
        .then((rows) => rows.map(serialize).at(0)),
    ),
  );

  export const sendWelcomeEmail = fn(Info.shape.email, async (email) => {
    try {
      const from = Resource.Email.sender.includes("@")
        ? `Peasy <${Resource.Email.sender}>`
        : `Peasy <mail@${Resource.Email.sender}>`;

      const cmd = new SendEmailCommand({
        Destination: { ToAddresses: [email] },
        FromEmailAddress: from,
        Content: {
          Simple: {
            Body: {
              Text: {
                Data: [
                  "Hey, just wanted to say thanks for joining Peasy!",
                  "",
                  "We're excited to have you on board and can't wait to see what you build.",
                  "Let us know if you have any questions or need help getting started.",
                  "",
                  "Best,",
                  "The Peasy Team",
                ].join("\n"),
              },
            },
            Subject: { Data: "Welcome to Peasy" },
          },
        },
      });
      await ses.send(cmd);
    } catch (ex) {
      console.error(ex);
    }
  });

  export function use() {
    const actor = useActor();
    if ("accountID" in actor.properties) return actor.properties.accountID;
    throw new Error(`Expected actor to have accountID`);
  }

  function serialize(
    input: typeof accountTable.$inferSelect,
  ): z.infer<typeof Info> {
    return {
      id: input.id,
      email: input.email,
    };
  }
}
