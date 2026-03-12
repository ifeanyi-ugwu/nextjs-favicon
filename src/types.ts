export interface Options {
  /** Path to source image (SVG, PNG, JPG) */
  source: string;
  /** App name used in manifest and metadata */
  name?: string;
  /** Manifest background_color */
  bgColor: string;
  /** Manifest theme_color */
  themeColor: string;
  /** Whether to generate site.webmanifest */
  manifest: boolean;
  /** Whether to patch layout.tsx / _document.tsx */
  patch: boolean;
  /** Force router type instead of auto-detecting */
  router?: "app" | "pages";
  /** Project root (defaults to process.cwd()) */
  cwd: string;
}

export interface DetectResult {
  router: "app" | "pages";
  /** Absolute path to app/ or pages/ dir */
  routerDir: string;
  /** Absolute path to public/ dir */
  publicDir: string;
}

export interface WrittenFiles {
  /** Files written relative to cwd */
  files: string[];
}
