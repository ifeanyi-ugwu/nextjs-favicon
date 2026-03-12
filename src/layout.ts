import { readFile, outputFile, pathExists } from "fs-extra";
import { join, relative } from "path";
import type { DetectResult } from "./types.js";

export async function patchLayout(
  detected: DetectResult,
  cwd: string,
  name: string
): Promise<string | null> {
  const candidates = [
    join(detected.routerDir, "layout.tsx"),
    join(detected.routerDir, "layout.ts"),
    join(detected.routerDir, "layout.jsx"),
    join(detected.routerDir, "layout.js"),
  ];

  let layoutPath: string | null = null;
  for (const c of candidates) {
    if (await pathExists(c)) {
      layoutPath = c;
      break;
    }
  }

  if (!layoutPath) return null;

  let src = await readFile(layoutPath, "utf8");

  if (src.includes("appleWebApp")) return null;

  const hasMetadataImport = /import\s+type\s*\{[^}]*Metadata[^}]*\}\s+from\s+['"]next['"]/.test(src);
  if (!hasMetadataImport) {
    src = src.replace(
      /((?:import[^;]+;[\r\n]+)+)/,
      `$1import type { Metadata } from "next";\n`
    );
  }

  const hasMetadataExport = /export\s+(const|let)\s+metadata\s*[=:]/.test(src);
  if (hasMetadataExport) {
    src = src.replace(
      /(export\s+(?:const|let)\s+metadata[^{]*\{)/,
      `$1\n  appleWebApp: { title: "${name}" },`
    );
  } else {
    src = src.replace(
      /(export\s+default\s+)/,
      `export const metadata: Metadata = {\n  appleWebApp: { title: "${name}" },\n};\n\n$1`
    );
  }

  await outputFile(layoutPath, src);
  return relative(cwd, layoutPath);
}
