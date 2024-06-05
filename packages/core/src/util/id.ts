import { customAlphabet } from "nanoid/non-secure";

const nanoid = customAlphabet(
  "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz",
);
const lowercase = customAlphabet("123456789abcdefghijkmnopqrstuvwxyz");

const prefixes = {
  account: "act",
  user: "usr",
  shop: "shp",
  product: "prd",
  file: "fil",
  collection: "col",
} as const;

export function createID(prefix: keyof typeof prefixes): string {
  return [prefixes[prefix], nanoid(16)].join("_");
}

export function createSlug(name: string) {
  return [name.toLowerCase().replace(/[^a-z0-9\-]/g, "-"), lowercase(5)].join(
    "-",
  );
}
