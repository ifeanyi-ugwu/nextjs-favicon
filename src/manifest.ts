import { outputFile } from "fs-extra";
import { join, relative } from "path";
import type { DetectResult } from "./types.js";

export async function writeManifest(
  detected: DetectResult,
  cwd: string,
  name: string,
  bgColor: string,
  themeColor: string
): Promise<string> {
  const manifest = {
    name,
    short_name: name,
    icons: [
      {
        src: "/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    theme_color: themeColor,
    background_color: bgColor,
    display: "standalone",
  };

  // App router: manifest.json in app/ dir — Next.js auto-serves it at /manifest.json
  // Pages router: site.webmanifest in public/
  const dest =
    detected.router === "app"
      ? join(detected.routerDir, "manifest.json")
      : join(detected.publicDir, "site.webmanifest");

  await outputFile(dest, JSON.stringify(manifest, null, 2) + "\n");
  return relative(cwd, dest);
}
