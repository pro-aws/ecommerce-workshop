import { createSessionBuilder } from "sst/auth";
import type { sessions } from "@peasy-store/functions/sessions";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Routes from "@/lib/routes";

export module Session {
  export const cookieKey = "peasy_session";
  const builder = createSessionBuilder<typeof sessions.$type>();
  export type Info = ReturnType<typeof builder.verify>;

  export const exists = () => {
    return Session.get() !== undefined;
  };

  export const token = () => {
    const cookieStore = cookies();
    const cookie = cookieStore.get(cookieKey)?.value;
    return cookie;
  };

  export const get = () => {
    const token = Session.token();
    if (!token) return undefined;
    const verified = verify(token);
    return verified;
  };

  export const verify = (token: string) => {
    try {
      return builder.verify(token);
    } catch (e) {
      console.error(e);
      return redirect(Routes.signout);
    }
  };

  export const set = (token: string) => {
    const expires = new Date();
    expires.setDate(expires.getDate() + 90);

    const cookieStore = cookies();
    cookieStore.set(cookieKey, token, {
      path: "/",
      httpOnly: true,
      secure: true,
      expires,
      maxAge: 31536000,
      sameSite: "lax",
    });
  };

  export const clear = () => {
    const cookieStore = cookies();
    cookieStore.delete(cookieKey);
  };
}

