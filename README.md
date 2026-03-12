# nextjs-favicon

Generate and place all favicon files for a Next.js project in one command. Supports both the App Router and Pages Router, generates a PWA web manifest, and optionally patches metadata into your layout or document file.

## Usage

No install needed — run it directly in your Next.js project root:

```bash
npx nextjs-favicon <source> [options]
# or
pnpm dlx nextjs-favicon <source> [options]
# or
yarn dlx nextjs-favicon <source> [options]
```

`<source>` is the path to your source image (SVG, PNG, or JPG). A minimum size of 512×512 is recommended.

### Options

| Option                  | Default         | Description                                          |
| ----------------------- | --------------- | ---------------------------------------------------- |
| `-n, --name <name>`     | `"My App"`      | App name used in the web manifest                    |
| `--bg-color <color>`    | `"#ffffff"`     | Manifest `background_color`                          |
| `--theme-color <color>` | `"#000000"`     | Manifest `theme_color`                               |
| `--no-manifest`         | —               | Skip `site.webmanifest` / `manifest.json` generation |
| `--no-patch`            | —               | Skip patching `layout.tsx` or `_document.tsx`        |
| `--router <type>`       | auto-detected   | Force router type: `app` or `pages`                  |
| `--cwd <path>`          | `process.cwd()` | Project root directory                               |

### Examples

```bash
# Basic — auto-detects App or Pages Router
npx nextjs-favicon ./logo.svg

# With custom app name and brand colors
npx nextjs-favicon ./icon.png --name "My App" --theme-color "#0066cc" --bg-color "#f0f0f0"

# Skip manifest generation and file patching
npx nextjs-favicon ./icon.svg --no-manifest --no-patch

# Force Pages Router detection
npx nextjs-favicon ./icon.png --router pages

# Run from a different directory
npx nextjs-favicon ./icon.png --cwd /path/to/nextjs-project
```

## What gets generated

### App Router

| File                     | Location  | Purpose                                        |
| ------------------------ | --------- | ---------------------------------------------- |
| `favicon.ico`            | `app/`    | Browser tab icon                               |
| `icon0.svg`              | `app/`    | SVG icon (only when source is SVG)             |
| `icon1.png` / `icon.png` | `app/`    | 96×96 PNG icon                                 |
| `apple-icon.png`         | `app/`    | 180×180 Apple touch icon                       |
| `icon-192x192.png`       | `public/` | PWA icon                                       |
| `icon-512x512.png`       | `public/` | PWA icon                                       |
| `manifest.json`          | `app/`    | Web manifest (auto-served at `/manifest.json`) |

### Pages Router

| File                   | Location  | Purpose                  |
| ---------------------- | --------- | ------------------------ |
| `favicon.ico`          | `public/` | Browser tab icon         |
| `apple-touch-icon.png` | `public/` | 180×180 Apple touch icon |
| `favicon-16x16.png`    | `public/` | 16×16 favicon            |
| `favicon-32x32.png`    | `public/` | 32×32 favicon            |
| `icon-192x192.png`     | `public/` | PWA icon                 |
| `icon-512x512.png`     | `public/` | PWA icon                 |
| `site.webmanifest`     | `public/` | Web manifest             |

## File patching

By default, the tool patches your project files to wire up the generated icons.

**App Router** — adds an `appleWebApp` entry to the `metadata` export in `app/layout.tsx`:

```ts
export const metadata: Metadata = {
  // ...existing metadata...
  appleWebApp: { title: "My App" },
};
```

**Pages Router** — adds meta/link tags to `pages/_document.tsx`:

```html
<meta name="apple-mobile-web-app-title" content="My App" />
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
<link rel="manifest" href="/site.webmanifest" />
```

Patching is skipped if the relevant metadata already exists.

## Programmatic API

Install the package first:

```bash
npm install nextjs-favicon
# or
pnpm add nextjs-favicon
# or
yarn add nextjs-favicon
```

```ts
import { run, detect } from "nextjs-favicon";

const { files } = await run({
  source: "./logo.png",
  name: "My App",
  bgColor: "#ffffff",
  themeColor: "#000000",
  manifest: true,
  patch: true,
  cwd: process.cwd(),
});

console.log("Written files:", files);
```

To only detect the project structure:

```ts
import { detect } from "nextjs-favicon";

const { router, dir } = detect(process.cwd());
// router: 'app' | 'pages'
// dir: path to the detected router directory
```

## License

MIT
