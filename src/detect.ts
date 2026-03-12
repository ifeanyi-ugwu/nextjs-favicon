import { existsSync } from "fs";
import { join } from "path";
import type { DetectResult } from "./types.js";

/** Priority-ordered candidates: [routerType, relative subpath] */
const CANDIDATES: Array<["app" | "pages", string]> = [
  ["app", "src/app"],
  ["app", "app"],
  ["pages", "src/pages"],
  ["pages", "pages"],
];

export function detect(
  cwd: string,
  forceRouter?: "app" | "pages"
): DetectResult {
  const publicDir = join(cwd, "public");

  if (forceRouter) {
    const candidate = CANDIDATES.find(([r]) => r === forceRouter);
    const subpath = candidate ? candidate[1] : forceRouter === "app" ? "app" : "pages";
    return {
      router: forceRouter,
      routerDir: join(cwd, subpath),
      publicDir,
    };
  }

  for (const [router, subpath] of CANDIDATES) {
    const full = join(cwd, subpath);
    if (existsSync(full)) {
      return { router, routerDir: full, publicDir };
    }
  }

  throw new Error(
    "Could not detect a Next.js project structure. " +
      "Expected one of: src/app, app, src/pages, pages. " +
      "Run this command from the root of your Next.js project, or use --router to force a type."
  );
}
