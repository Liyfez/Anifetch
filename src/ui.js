/**
 * Smooth Pink Gradient Banner & Clean Output Renderer for anifetch.
 */

// ANSI Color & Style Helpers (supports NO_COLOR / dumb terminals)
const useColor = !process.env.NO_COLOR && process.stdout.isTTY !== false;

export const c = {
  bold: (s) => (useColor ? `\x1b[1m${s}\x1b[0m` : String(s)),
  dim: (s) => (useColor ? `\x1b[2m${s}\x1b[0m` : String(s)),
  cyan: (s) => (useColor ? `\x1b[36m${s}\x1b[0m` : String(s)),
  green: (s) => (useColor ? `\x1b[32m${s}\x1b[0m` : String(s)),
  yellow: (s) => (useColor ? `\x1b[33m${s}\x1b[0m` : String(s)),
  red: (s) => (useColor ? `\x1b[31m${s}\x1b[0m` : String(s)),
  magenta: (s) => (useColor ? `\x1b[35m${s}\x1b[0m` : String(s)),
  pink: (s) => (useColor ? `\x1b[38;2;255;105;180m${s}\x1b[0m` : String(s))
};

const ASCII_BANNER = [
  "   █████╗ ███╗   ██╗██╗███████╗███████╗████████╗ ██████╗██╗  ██╗",
  "  ██╔══██╗████╗  ██║██║██╔════╝██╔════╝╚══██╔══╝██╔════╝██║  ██║",
  "  ███████║██╔██╗ ██║██║█████╗  █████╗     ██║   ██║     ███████║",
  "  ██╔══██║██║╚██╗██║██║██╔══╝  ██╔══╝     ██║   ██║     ██╔══██║",
  "  ██║  ██║██║ ╚████║██║██║     ███████╗   ██║   ╚██████╗██║  ██║",
  "  ╚═╝  ╚═╝╚═╝  ╚═══╝╚═╝╚═╝     ╚══════╝   ╚═╝    ╚═════╝╚═╝  ╚═╝"
];

/**
 * Prints the big ANIFETCH banner with a smooth pink/magenta gradient.
 */
export function printBanner() {
  if (!useColor) {
    console.log(ASCII_BANNER.join("\n"));
    console.log("  Fast AniList Data Fetcher & Multi-Format Exporter (JSON, CSV, TXT, MD)\n");
    return;
  }

  // Render 2D smooth pink gradient (from vivid neon pink to soft sakura pink)
  for (let row = 0; row < ASCII_BANNER.length; row++) {
    const line = ASCII_BANNER[row];
    let coloredLine = "";

    for (let col = 0; col < line.length; col++) {
      const char = line[col];
      const t = (col / line.length) * 0.65 + (row / ASCII_BANNER.length) * 0.35;
      const r = 255;
      const g = Math.round(25 + t * 165);
      const b = Math.round(115 + t * 95);
      coloredLine += `\x1b[38;2;${r};${g};${b}m${char}`;
    }
    console.log(coloredLine + "\x1b[0m");
  }

  console.log(`  \x1b[38;2;255;150;200m⚡ Fast AniList Data Fetcher & Multi-Format Exporter\x1b[0m\n`);
}

/**
 * Prints clean export confirmation and helpful example commands using generic <username>.
 */
export function printExportSummary(exportedFiles, outputDir) {
  if (!exportedFiles || exportedFiles.length === 0) return;

  const filenames = exportedFiles.map(f => f.split(/[\\/]/).pop()).join(", ");
  console.log(`${c.green("✔")} ${c.bold("Exported to:")} ${c.yellow(outputDir)} ${c.dim(`(${filenames})`)}`);

  console.log(`\n${c.bold("EXAMPLES:")}`);
  console.log(`  ${c.green("anifetch <username> --completed --json")}    ${c.dim("Export completed anime to JSON")}`);
  console.log(`  ${c.green("anifetch <username> --all --csv")}           ${c.dim("Export all anime to spreadsheet")}`);
  console.log(`  ${c.green("anifetch <username> -f all")}                ${c.dim("Export to JSON, CSV, TXT & Markdown")}`);

  console.log(`\n${c.pink("👉 Run 'anifetch --help' to see all options, filters & formats.")}\n`);
}
