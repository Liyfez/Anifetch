/**
 * Vibrant Pink, Rose & Sakura Palette & Output Renderer for anifetch.
 */
import path from "node:path";
import process from "node:process";

// ANSI Color & Style Helpers (supports NO_COLOR / dumb terminals)
const useColor = !process.env.NO_COLOR && process.stdout.isTTY !== false;

export const c = {
  bold: (s) => (useColor ? `\x1b[1m${s}\x1b[0m` : String(s)),
  dim: (s) => (useColor ? `\x1b[38;2;160;140;175m${s}\x1b[0m` : String(s)),
  hotPink: (s) => (useColor ? `\x1b[38;2;255;105;170m\x1b[1m${s}\x1b[0m` : String(s)), // nice, lighter vibrant pink
  pink: (s) => (useColor ? `\x1b[38;2;255;120;175m${s}\x1b[0m` : String(s)),
  rose: (s) => (useColor ? `\x1b[38;2;255;145;190m${s}\x1b[0m` : String(s)),
  sakura: (s) => (useColor ? `\x1b[38;2;255;185;210m${s}\x1b[0m` : String(s)),
  lavender: (s) => (useColor ? `\x1b[38;2;225;180;245m${s}\x1b[0m` : String(s)),
  white: (s) => (useColor ? `\x1b[1m\x1b[37m${s}\x1b[0m` : String(s)),
  green: (s) => (useColor ? `\x1b[38;2;255;130;185m${s}\x1b[0m` : String(s)),
  red: (s) => (useColor ? `\x1b[38;2;255;70;110m\x1b[1m${s}\x1b[0m` : String(s))
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
 * Prints the big ANIFETCH banner with the vibrant smooth 2D pink gradient.
 */
export function printBanner() {
  if (!useColor) {
    console.log(ASCII_BANNER.join("\n"));
    console.log("  🌸 Fast AniList Data Fetcher & Multi-Format Exporter\n");
    return;
  }

  // Render 2D smooth pink gradient (from neon magenta-pink to soft sakura pastel)
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

  console.log(`  \x1b[38;2;255;160;210m🌸 Fast AniList Data Fetcher & Multi-Format Exporter\x1b[0m\n`);
}

/**
 * Prints the pink-themed help guide.
 */
export function printPinkHelp(version = "1.0.0") {
  console.log(`
${c.hotPink("USAGE:")}
  ${c.rose("anifetch")}                                    ${c.dim("Open interactive mode")}
  ${c.rose("anifetch")} ${c.sakura("<username>")} ${c.dim("[options]")}              ${c.dim("Fetch profile data directly")}
  ${c.rose("npx anifetch")} ${c.sakura("<username>")} ${c.dim("[options]")}          ${c.dim("Run via npx directly")}

${c.hotPink("EXAMPLES:")}
  ${c.rose("anifetch")} ${c.sakura("<username>")}                    ${c.dim("Fetch full profile & export to JSON")}
  ${c.rose("anifetch")} ${c.sakura("<username>")} ${c.lavender("--completed --json")} ${c.dim("Export only completed anime to JSON")}
  ${c.rose("anifetch")} ${c.sakura("<username>")} ${c.lavender("--all --csv")}        ${c.dim("Export all anime to CSV spreadsheet")}
  ${c.rose("anifetch")} ${c.sakura("<username>")} ${c.lavender("--dropped --txt")}    ${c.dim("Export dropped anime to plain text")}
  ${c.rose("anifetch")} ${c.sakura("<username>")} ${c.lavender("-f all")}             ${c.dim("Export to JSON, CSV, TXT & Markdown")}
  ${c.rose("anifetch")} ${c.sakura("<username>")} ${c.lavender("--min-score 85")}     ${c.dim("Export only anime rated 85+")}
  ${c.rose("anifetch")} ${c.sakura("<username>")} ${c.lavender("--json-stdout")}      ${c.dim("Stream pure JSON to stdout / jq")}
  ${c.rose("anifetch")} ${c.lavender("--demo")}                        ${c.dim("Test data fetch with sample demo profile")}

${c.hotPink("OPTIONS & FLAGS:")}
  ${c.rose("-u, --username <name>")}    ${c.dim("AniList username to fetch (or pass as first argument)")}
  ${c.rose("-s, --status <status>")}    ${c.dim("Filter status: completed, watching, dropped, paused, planning, all (default: all)")}
  ${c.rose("-f, --format <format>")}    ${c.dim("Export format: json, csv, txt, md, all (default: json)")}
  ${c.rose("-o, --output <dir>")}       ${c.dim("Destination folder for files (default: ./anifetch-output)")}
  ${c.rose("-d, --demo")}               ${c.dim("Run test with sample demo profile (no internet required)")}
  ${c.rose("--min-score <number>")}     ${c.dim("Filter anime by minimum rating (e.g. --min-score 80)")}
  ${c.rose("--genre <genre>")}          ${c.dim("Filter anime by genre (e.g. --genre Action)")}
  ${c.rose("--sort <field>")}           ${c.dim("Sort by: score, title, episodes, date, popularity")}
  ${c.rose("--order <asc|desc>")}       ${c.dim("Sort order: asc or desc (default: desc)")}
  ${c.rose("--json-stdout")}            ${c.dim("Output pure JSON to stdout (disables banner and file writes)")}
  ${c.rose("-q, --quiet")}              ${c.dim("Quiet mode (suppress terminal messages)")}
  ${c.rose("-v, --version")}            ${c.dim("Show version number")}
  ${c.rose("-h, --help")}               ${c.dim("Show this help guide")}

${c.hotPink("SHORTHAND SWITCHES:")}
  ${c.lavender("--completed")}, ${c.lavender("--watching")}, ${c.lavender("--dropped")}, ${c.lavender("--paused")}, ${c.lavender("--planning")}, ${c.lavender("--all")}
  ${c.lavender("--json")}, ${c.lavender("--csv")}, ${c.lavender("--txt")}, ${c.lavender("--md")}

${c.sakura("For full usage guide, run:")} ${c.rose("anifetch --help")}
`);
}

/**
 * Prints clean export confirmation with full path.
 */
export function printExportSummary(exportedFiles, outputDir) {
  if (!exportedFiles || exportedFiles.length === 0) return;

  const fullPath = path.isAbsolute(outputDir) ? outputDir : path.resolve(process.cwd(), outputDir);
  const filenames = exportedFiles.map(f => f.split(/[\\/]/).pop()).join(", ");

  console.log(`🌸 ${c.bold("Exported to:")} ${c.sakura(fullPath)} ${c.dim(`(${filenames})`)}`);

  console.log(`\n${c.hotPink("EXAMPLES:")}`);
  console.log(`  ${c.rose("anifetch <username> --completed --json")}    ${c.dim("Export completed anime to JSON")}`);
  console.log(`  ${c.rose("anifetch <username> --all --csv")}           ${c.dim("Export all anime to spreadsheet")}`);
  console.log(`  ${c.rose("anifetch <username> -f all")}                ${c.dim("Export to JSON, CSV, TXT & Markdown")}`);

  console.log(`\n${c.sakura("Run 'anifetch --help' to see all options, filters & formats.")}\n`);
}
