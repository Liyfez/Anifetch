/**
 * Soft Pastel Rose & Sakura Palette & Output Renderer for anifetch.
 */
import path from "node:path";
import process from "node:process";

// ANSI Color & Style Helpers (supports NO_COLOR / dumb terminals)
const useColor = !process.env.NO_COLOR && process.stdout.isTTY !== false;

export const c = {
  bold: (s) => (useColor ? `\x1b[1m${s}\x1b[0m` : String(s)),
  dim: (s) => (useColor ? `\x1b[38;2;156;163;175m${s}\x1b[0m` : String(s)),
  rose: (s) => (useColor ? `\x1b[38;2;244;114;182m\x1b[1m${s}\x1b[0m` : String(s)),
  lightPink: (s) => (useColor ? `\x1b[38;2;249;168;212m${s}\x1b[0m` : String(s)),
  sakura: (s) => (useColor ? `\x1b[38;2;251;207;232m${s}\x1b[0m` : String(s)),
  lavender: (s) => (useColor ? `\x1b[38;2;233;213;255m${s}\x1b[0m` : String(s)),
  muted: (s) => (useColor ? `\x1b[38;2;156;163;175m${s}\x1b[0m` : String(s)),
  mint: (s) => (useColor ? `\x1b[38;2;52;211;153m${s}\x1b[0m` : String(s)),
  red: (s) => (useColor ? `\x1b[38;2;251;113;133m\x1b[1m${s}\x1b[0m` : String(s)),
  white: (s) => (useColor ? `\x1b[1m\x1b[37m${s}\x1b[0m` : String(s))
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
 * Prints the big ANIFETCH banner with a soft pastel pink/sakura gradient.
 */
export function printBanner() {
  if (!useColor) {
    console.log(ASCII_BANNER.join("\n"));
    console.log("  🌸 Fast AniList Data Fetcher & Multi-Format Exporter\n");
    return;
  }

  // Render 2D soft pastel gradient (from soft rose #F472B6 to pastel sakura #FCE7F3)
  for (let row = 0; row < ASCII_BANNER.length; row++) {
    const line = ASCII_BANNER[row];
    let coloredLine = "";

    for (let col = 0; col < line.length; col++) {
      const char = line[col];
      const t = (col / line.length) * 0.6 + (row / ASCII_BANNER.length) * 0.4;
      const r = Math.round(244 + t * 8);
      const g = Math.round(114 + t * 117);
      const b = Math.round(182 + t * 61);
      coloredLine += `\x1b[38;2;${r};${g};${b}m${char}`;
    }
    console.log(coloredLine + "\x1b[0m");
  }

  console.log(`  \x1b[38;2;244;114;182m🌸 Fast AniList Data Fetcher & Multi-Format Exporter\x1b[0m\n`);
}

/**
 * Prints the soft pink-themed help guide.
 */
export function printPinkHelp(version = "1.0.0") {
  console.log(`
${c.rose("USAGE:")}
  ${c.lightPink("anifetch")}                                    ${c.muted("Open interactive mode")}
  ${c.lightPink("anifetch")} ${c.sakura("<username>")} ${c.muted("[options]")}              ${c.muted("Fetch profile data directly")}
  ${c.lightPink("npx anifetch")} ${c.sakura("<username>")} ${c.muted("[options]")}          ${c.muted("Run via npx directly")}

${c.rose("EXAMPLES:")}
  ${c.lightPink("anifetch")} ${c.sakura("<username>")}                    ${c.muted("Fetch full profile & export to JSON")}
  ${c.lightPink("anifetch")} ${c.sakura("<username>")} ${c.lavender("--completed --json")} ${c.muted("Export only completed anime to JSON")}
  ${c.lightPink("anifetch")} ${c.sakura("<username>")} ${c.lavender("--all --csv")}        ${c.muted("Export all anime to CSV spreadsheet")}
  ${c.lightPink("anifetch")} ${c.sakura("<username>")} ${c.lavender("--dropped --txt")}    ${c.muted("Export dropped anime to plain text")}
  ${c.lightPink("anifetch")} ${c.sakura("<username>")} ${c.lavender("-f all")}             ${c.muted("Export to JSON, CSV, TXT & Markdown")}
  ${c.lightPink("anifetch")} ${c.sakura("<username>")} ${c.lavender("--min-score 85")}     ${c.muted("Export only anime rated 85+")}
  ${c.lightPink("anifetch")} ${c.sakura("<username>")} ${c.lavender("--json-stdout")}      ${c.muted("Stream pure JSON to stdout / jq")}
  ${c.lightPink("anifetch")} ${c.lavender("--demo")}                        ${c.muted("Test data fetch with sample demo profile")}

${c.rose("OPTIONS & FLAGS:")}
  ${c.lightPink("-u, --username <name>")}    ${c.muted("AniList username to fetch (or pass as first argument)")}
  ${c.lightPink("-s, --status <status>")}    ${c.muted("Filter status: completed, watching, dropped, paused, planning, all (default: all)")}
  ${c.lightPink("-f, --format <format>")}    ${c.muted("Export format: json, csv, txt, md, all (default: json)")}
  ${c.lightPink("-o, --output <dir>")}       ${c.muted("Destination folder for files (default: ./anifetch-output)")}
  ${c.lightPink("-d, --demo")}               ${c.muted("Run test with sample demo profile (no internet required)")}
  ${c.lightPink("--min-score <number>")}     ${c.muted("Filter anime by minimum rating (e.g. --min-score 80)")}
  ${c.lightPink("--genre <genre>")}          ${c.muted("Filter anime by genre (e.g. --genre Action)")}
  ${c.lightPink("--sort <field>")}           ${c.muted("Sort by: score, title, episodes, date, popularity")}
  ${c.lightPink("--order <asc|desc>")}       ${c.muted("Sort order: asc or desc (default: desc)")}
  ${c.lightPink("--json-stdout")}            ${c.muted("Output pure JSON to stdout (disables banner and file writes)")}
  ${c.lightPink("-q, --quiet")}              ${c.muted("Quiet mode (suppress terminal messages)")}
  ${c.lightPink("-v, --version")}            ${c.muted("Show version number")}
  ${c.lightPink("-h, --help")}               ${c.muted("Show this help guide")}

${c.rose("SHORTHAND SWITCHES:")}
  ${c.lavender("--completed")}, ${c.lavender("--watching")}, ${c.lavender("--dropped")}, ${c.lavender("--paused")}, ${c.lavender("--planning")}, ${c.lavender("--all")}
  ${c.lavender("--json")}, ${c.lavender("--csv")}, ${c.lavender("--txt")}, ${c.lavender("--md")}

${c.muted("ℹ For full usage guide, run:")} ${c.lightPink("anifetch --help")}
`);
}

/**
 * Prints clean export confirmation with full path and minimalist symbols.
 */
export function printExportSummary(exportedFiles, outputDir) {
  if (!exportedFiles || exportedFiles.length === 0) return;

  const fullPath = path.isAbsolute(outputDir) ? outputDir : path.resolve(process.cwd(), outputDir);
  const filenames = exportedFiles.map(f => f.split(/[\\/]/).pop()).join(", ");

  console.log(`${c.mint("✔")} ${c.bold("Exported to:")} ${c.sakura(fullPath)} ${c.muted(`(${filenames})`)}`);

  console.log(`\n${c.rose("EXAMPLES:")}`);
  console.log(`  ${c.lightPink("anifetch <username> --completed --json")}    ${c.muted("Export completed anime to JSON")}`);
  console.log(`  ${c.lightPink("anifetch <username> --all --csv")}           ${c.muted("Export all anime to spreadsheet")}`);
  console.log(`  ${c.lightPink("anifetch <username> -f all")}                ${c.muted("Export to JSON, CSV, TXT & Markdown")}`);

  console.log(`\n${c.muted("ℹ Run 'anifetch --help' to see all options, filters & formats.")}\n`);
}
