import { createSessionBuilder } from "sst/auth";

export const sessions = createSessionBuilder<{
  account: {
    email: string;
  };
}>();
