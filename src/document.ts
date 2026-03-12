import { readFile, outputFile, pathExists } from "fs-extra";
import { join, relative } from "path";
import type { DetectResult } from "./types.js";

export async function patchDocument(
  detected: DetectResult,
  cwd: string,
  name: string
): Promise<string | null> {
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

  if (src.includes("apple-mobile-web-app-title") || src.includes("favicon.ico")) return null;
  if (!src.includes("<Head>")) return null;

  const tags = `        <meta name="apple-mobile-web-app-title" content="${name}" />
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />`;

  src = src.replace("<Head>", `<Head>\n${tags}`);
  await outputFile(docPath, src);
  return relative(cwd, docPath);
}
