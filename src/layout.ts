import { readFile, outputFile, pathExists } from "fs-extra";
import { join, relative } from "path";
import type { DetectResult } from "./types.js";

const ICONS_BLOCK = `  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
    other: [{ rel: "manifest", url: "/site.webmanifest" }],
  },`;

function buildMetadataExport(name: string): string {
  return `export const metadata: Metadata = {
  title: "${name}",
  description: "${name}",
${ICONS_BLOCK}
};\n\n`;
}

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

  // Already has icons in metadata — don't double-patch
  if (src.includes("icons:") && src.includes("favicon")) return null;

  const hasMetadataExport = /export\s+(const|let)\s+metadata\s*[=:]/.test(src);
  const hasMetadataImport = /import\s+type\s*\{[^}]*Metadata[^}]*\}\s+from\s+['"]next['"]/.test(src);

  if (!hasMetadataImport) {
    // Prepend Metadata import after the last import line
    src = src.replace(
      /((?:import[^;]+;[\r\n]+)+)/,
      `$1import type { Metadata } from "next";\n`
    );
  }

  if (hasMetadataExport) {
    // Inject icons into the existing metadata object
    src = src.replace(
      /(export\s+(?:const|let)\s+metadata[^{]*\{)/,
      `$1\n${ICONS_BLOCK}`
    );
  } else {
    // Insert a new metadata export before the default export
    src = src.replace(
      /(export\s+default\s+)/,
      `${buildMetadataExport(name)}$1`
    );
  }

  await outputFile(layoutPath, src);
  return relative(cwd, layoutPath);
}
