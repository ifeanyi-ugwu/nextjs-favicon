import { readFile, outputFile, pathExists } from "fs-extra";
import { join, relative } from "path";
import type { DetectResult } from "./types.js";

const LINK_TAGS = `        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />`;

export async function patchDocument(
  detected: DetectResult,
  cwd: string
): Promise<string | null> {
  // pages dir lives one level up from routerDir (e.g. src/pages → look for src/pages/_document)
  const candidates = [
    join(detected.routerDir, "_document.tsx"),
    join(detected.routerDir, "_document.ts"),
    join(detected.routerDir, "_document.jsx"),
    join(detected.routerDir, "_document.js"),
  ];

  let docPath: string | null = null;
  for (const c of candidates) {
    if (await pathExists(c)) {
      docPath = c;
      break;
    }
  }

  if (!docPath) return null;

  let src = await readFile(docPath, "utf8");

  // Already patched
  if (src.includes("favicon.ico") || src.includes("site.webmanifest")) return null;

  // Insert link tags inside the first <Head> block
  if (!src.includes("<Head>")) return null;

  src = src.replace("<Head>", `<Head>\n${LINK_TAGS}`);
  await outputFile(docPath, src);
  return relative(cwd, docPath);
}
