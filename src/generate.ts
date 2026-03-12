import sharp from "sharp";
import pngToIco from "png-to-ico";
import { outputFile, copy } from "fs-extra";
import { join, relative, extname } from "path";
import type { DetectResult } from "./types.js";

interface Size {
  width: number;
  height: number;
  name: string;
  dir: "router" | "public";
}

function appRouterSizes(hasSvg: boolean): Size[] {
  return [
    { width: 96, height: 96, name: hasSvg ? "icon1.png" : "icon.png", dir: "router" },
    { width: 180, height: 180, name: "apple-icon.png", dir: "router" },
    { width: 192, height: 192, name: "icon-192x192.png", dir: "public" },
    { width: 512, height: 512, name: "icon-512x512.png", dir: "public" },
  ];
}

const PAGES_ROUTER_SIZES: Size[] = [
  { width: 180, height: 180, name: "apple-touch-icon.png", dir: "public" },
  { width: 16, height: 16, name: "favicon-16x16.png", dir: "public" },
  { width: 32, height: 32, name: "favicon-32x32.png", dir: "public" },
  { width: 192, height: 192, name: "icon-192x192.png", dir: "public" },
  { width: 512, height: 512, name: "icon-512x512.png", dir: "public" },
];

async function resize(source: string, width: number, height: number): Promise<Buffer> {
  return sharp(source)
    .resize(width, height, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
}

export async function generate(
  source: string,
  detected: DetectResult,
  cwd: string
): Promise<string[]> {
  const isSvg = extname(source).toLowerCase() === ".svg";
  const sizes =
    detected.router === "app" ? appRouterSizes(isSvg) : PAGES_ROUTER_SIZES;
  const written: string[] = [];

  const [px16, px32, px48] = await Promise.all([
    resize(source, 16, 16),
    resize(source, 32, 32),
    resize(source, 48, 48),
  ]);
  const icoBuffer = await pngToIco([px16, px32, px48]);
  const icoPath =
    detected.router === "app"
      ? join(detected.routerDir, "favicon.ico")
      : join(detected.publicDir, "favicon.ico");
  await outputFile(icoPath, icoBuffer);
  written.push(relative(cwd, icoPath));

  if (detected.router === "app" && isSvg) {
    const svgDest = join(detected.routerDir, "icon0.svg");
    await copy(source, svgDest);
    written.push(relative(cwd, svgDest));
  }

  await Promise.all(
    sizes.map(async ({ width, height, name, dir }) => {
      const buf =
        width === 16 && height === 16
          ? px16
          : width === 32 && height === 32
          ? px32
          : width === 48 && height === 48
          ? px48
          : await resize(source, width, height);

      const dest =
        dir === "router"
          ? join(detected.routerDir, name)
          : join(detected.publicDir, name);

      await outputFile(dest, buf);
      written.push(relative(cwd, dest));
    })
  );

  return written;
}
