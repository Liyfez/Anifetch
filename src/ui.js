/**
 * Terminal output renderer for anifetch: Big ASCII banner, data fetch progress & export notices.
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
  blue: (s) => (useColor ? `\x1b[34m${s}\x1b[0m` : String(s))
};

/**
 * Prints the big bold ANIFETCH banner.
 */
export function printBanner() {
  console.log(c.cyan(`
   █████╗ ███╗   ██╗██╗███████╗███████╗████████╗ ██████╗██╗  ██╗
  ██╔══██╗████╗  ██║██║██╔════╝██╔════╝╚══██╔══╝██╔════╝██║  ██║
  ███████║██╔██╗ ██║██║█████╗  █████╗     ██║   ██║     ███████║
  ██╔══██║██║╚██╗██║██║██╔══╝  ██╔══╝     ██║   ██║     ██╔══██║
  ██║  ██║██║ ╚████║██║██║     ███████╗   ██║   ╚██████╗██║  ██║
  ╚═╝  ╚═╝╚═╝  ╚═══╝╚═╝╚═╝     ╚══════╝   ╚═╝    ╚═════╝╚═╝  ╚═╝`));
  console.log(c.dim(`  ⚡ AniList Data Fetcher & Multi-Format Exporter (JSON, CSV, TXT, MD)\n`));
}

/**
 * Prints a clean fetch summary (how many entries were retrieved).
 */
export function printFetchSummary(parsedData, username) {
  const cOverview = parsedData.status_counts || {};
  const total = parsedData.total_anime_count || 0;

  const parts = [];
  if (cOverview.completed) parts.push(`${cOverview.completed} completed`);
  if (cOverview.watching) parts.push(`${cOverview.watching} watching`);
  if (cOverview.dropped) parts.push(`${cOverview.dropped} dropped`);
  if (cOverview.planning) parts.push(`${cOverview.planning} planning`);
  if (cOverview.paused) parts.push(`${cOverview.paused} paused`);

  const breakdownStr = parts.length > 0 ? c.dim(`(${parts.join(", ")})`) : "";
  console.log(`[+] ${c.bold("Fetched:")} ${c.yellow(c.bold(total))} anime entries for ${c.cyan(username)} ${breakdownStr}`);
}

/**
 * Prints the exported files notice and next helpful commands.
 */
export function printExportSummary(exportedFiles, outputDir, username) {
  if (!exportedFiles || exportedFiles.length === 0) return;

  console.log(`\n${c.green("✔")} ${c.bold(c.green(`Successfully exported ${exportedFiles.length} file(s) to:`))} ${c.cyan(outputDir)}`);
  for (const file of exportedFiles) {
    const filename = file.split(/[\\/]/).pop();
    const ext = filename.split(".").pop().toUpperCase();
    console.log(`  • ${c.bold(`[${ext}]`)} ${c.yellow(filename)}`);
  }

  console.log(`\n${c.dim("💡 Quick Tips:")}`);
  console.log(`   Export to spreadsheet : ${c.green(`anifetch ${username} --csv`)}`);
  console.log(`   Export all formats    : ${c.green(`anifetch ${username} -f all`)}`);
  console.log(`   Export completed only : ${c.green(`anifetch ${username} --completed --json`)}\n`);
}
