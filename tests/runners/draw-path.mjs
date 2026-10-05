import { existsSync } from "node:fs";
import { resolve } from "node:path";

const root = new URL("../../", import.meta.url).pathname;
export const drawCheckout = [process.env.NOT3_DRAW_DIR, resolve(root, "../draw"), resolve(root, "../../../draw")]
  .find((path) => path && existsSync(resolve(path, "src/keys.ts")));
