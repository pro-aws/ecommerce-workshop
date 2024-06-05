import { createSessionBuilder } from "sst/auth";

// TODO: #8 Before we hop into the authenticator I wanted
// to point out that this is where we definen the "shape"
// of our sessions. This is effectively what the JWT token
// will contain. In this simple case, the user's email.
export const sessions = createSessionBuilder<{
  account: {
    email: string;
  };
}>();
