import { Context } from "./context";

export interface PublicActor {
  type: "public";
  properties: {};
}

export interface AccountActor {
  type: "account";
  properties: {
    accountID: string;
    email: string;
  };
}

export interface UserActor extends Omit<AccountActor, "type"> {
  type: "user";
  properties: AccountActor["properties"] & {
    userID: string;
    shopID: string;
  };
}

export interface SystemActor {
  type: "system";
  properties: {
    shopID: string;
  };
}

export type Actor = PublicActor | AccountActor | UserActor | SystemActor;

export const { use: useActor, with: withActor } =
  Context.create<Actor>("actor");

export function assertActor<T extends Actor["type"]>(type: T) {
  const actor = useActor();
  if (actor.type !== type) {
    if (type === "account" && actor.type === "user") {
      return actor;
    }
    throw new Error(`Expected actor type ${type}, got ${actor.type}`);
  }

  return actor as Extract<Actor, { type: T }>;
}
