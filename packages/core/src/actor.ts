import { Context } from "./context";

export interface PublicActor {
  type: "public";
  properties: {};
}

export interface AccountActor {
  type: "account";
  properties: {
    email: string;
  };
}

export type Actor = PublicActor | AccountActor;

export const { use: useActor, with: withActor } =
  Context.create<Actor>("actor");

export function assertActor<T extends Actor["type"]>(type: T) {
  const actor = useActor();
  if (actor.type !== type) {
    throw new Error(`Expected actor type ${type}, got ${actor.type}`);
  }

  return actor as Extract<Actor, { type: T }>;
}
