import { resolve } from "path";
import { detect } from "./detect.js";
import { generate } from "./generate.js";
import { writeManifest } from "./manifest.js";
import { patchDocument } from "./document.js";
import type { Options, WrittenFiles } from "./types.js";

export type { Options, WrittenFiles };
export { detect } from "./detect.js";

export async function run(opts: Options): Promise<WrittenFiles> {
  const cwd = resolve(opts.cwd);
  const source = resolve(opts.source);
  const name = opts.name ?? "My App";

  const detected = detect(cwd, opts.router);
  const files: string[] = [];

  const generated = await generate(source, detected, cwd);
  files.push(...generated);

  if (opts.manifest) {
    const manifestFile = await writeManifest(
      detected,
      cwd,
      name,
      opts.bgColor,
      opts.themeColor
    );
    files.push(manifestFile);
  }

  // App router: Next.js auto-discovers favicons via file conventions — no patching needed.
  // Pages router: inject <link> tags into _document.tsx.
  if (opts.patch && detected.router === "pages") {
    const patched = await patchDocument(detected, cwd);
    if (patched) files.push(patched);
  }

  return { files };
}
