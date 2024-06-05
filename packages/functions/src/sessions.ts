import { createSessionBuilder } from "sst/auth";

export const sessions = createSessionBuilder<{
  account: {
    accountID: string;
    email: string;
  };
}>();
