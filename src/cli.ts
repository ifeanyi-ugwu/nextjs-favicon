import { Command } from "commander";
import { run } from "./index.js";

const program = new Command();

program
  .name("nextjs-favicon")
  .description("Generate and place all favicon files for your Next.js project")
  .argument("<source>", "Path to source image (SVG, PNG, JPG — min 512x512 recommended)")
  .option("-n, --name <name>", "App name for manifest and metadata", "My App")
  .option("--bg-color <color>", "Manifest background_color", "#ffffff")
  .option("--theme-color <color>", "Manifest theme_color", "#000000")
  .option("--no-manifest", "Skip site.webmanifest generation")
  .option("--no-patch", "Skip layout.tsx / _document.tsx patching")
  .option("--router <type>", "Force router type: app or pages (auto-detected)")
  .option("--cwd <path>", "Project root directory", process.cwd())
  .action(async (source: string, opts) => {
    try {
      const { files } = await run({
        source,
        name: opts.name,
        bgColor: opts.bgColor,
        themeColor: opts.themeColor,
        manifest: opts.manifest,
        patch: opts.patch,
        router: opts.router as "app" | "pages" | undefined,
        cwd: opts.cwd,
      });

      console.log("\nFavicons written:\n");
      for (const f of files) {
        console.log(`  ${f}`);
      }
      console.log();
    } catch (err) {
      console.error((err as Error).message);
      process.exit(1);
    }
  });

program.parse();
