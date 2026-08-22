/**
 * Terminal UI rendering with boxes, colors, progress bars, and statistics dashboards.
 */

// ANSI Color & Style Helpers (supports NO_COLOR / dumb terminals)
const useColor = !process.env.NO_COLOR && process.stdout.isTTY !== false;

export const c = {
  bold: (s) => (useColor ? `\x1b[1m${s}\x1b[0m` : String(s)),
  dim: (s) => (useColor ? `\x1b[2m${s}\x1b[0m` : String(s)),
  italic: (s) => (useColor ? `\x1b[3m${s}\x1b[0m` : String(s)),
  underline: (s) => (useColor ? `\x1b[4m${s}\x1b[0m` : String(s)),
  cyan: (s) => (useColor ? `\x1b[36m${s}\x1b[0m` : String(s)),
  green: (s) => (useColor ? `\x1b[32m${s}\x1b[0m` : String(s)),
  yellow: (s) => (useColor ? `\x1b[33m${s}\x1b[0m` : String(s)),
  red: (s) => (useColor ? `\x1b[31m${s}\x1b[0m` : String(s)),
  magenta: (s) => (useColor ? `\x1b[35m${s}\x1b[0m` : String(s)),
  blue: (s) => (useColor ? `\x1b[34m${s}\x1b[0m` : String(s)),
  bgCyan: (s) => (useColor ? `\x1b[46m\x1b[30m${s}\x1b[0m` : String(s)),
  bgMagenta: (s) => (useColor ? `\x1b[45m\x1b[37m${s}\x1b[0m` : String(s)),
  bgGreen: (s) => (useColor ? `\x1b[42m\x1b[30m${s}\x1b[0m` : String(s))
};

/**
 * Creates a visual percentage bar: e.g. [████████░░░░] 65%
 */
export function createProgressBar(percentage, length = 20, fillChar = "█", emptyChar = "░") {
  const clamped = Math.max(0, Math.min(100, percentage));
  const filledLength = Math.round((clamped / 100) * length);
  const emptyLength = length - filledLength;
  const bar = fillChar.repeat(filledLength) + emptyChar.repeat(emptyLength);
  return `${bar} ${clamped.toFixed(1)}%`;
}

/**
 * Prints the main application banner.
 */
export function printBanner() {
  console.log(c.cyan(`
   █████╗ ███╗   ██╗██╗███████╗███████╗████████╗ ██████╗██╗  ██╗
  ██╔══██╗████╗  ██║██║██╔════╝██╔════╝╚══██╔══╝██╔════╝██║  ██║
  ███████║██╔██╗ ██║██║█████╗  █████╗     ██║   ██║     ███████║
  ██╔══██║██║╚██╗██║██║██╔══╝  ██╔══╝     ██║   ██║     ██╔══██║
  ██║  ██║██║ ╚████║██║██║     ███████╗   ██║   ╚██████╗██║  ██║
  ╚═╝  ╚═╝╚═╝  ╚═══╝╚═╝╚═╝     ╚══════╝   ╚═╝    ╚═════╝╚═╝  ╚═╝
`));
  console.log(c.dim(`  ⚡ Fast AniList Profile Parser, Exporter & Deep Taste Analyzer\n`));
}

/**
 * Prints a stylized section header box.
 */
function printSectionHeader(title, icon = "📌") {
  console.log(`\n${c.bold(c.cyan(`╭── ${icon} ${title} `))}${c.dim("─".repeat(Math.max(4, 60 - title.length)))}`);
}

/**
 * Prints the rich terminal dashboard with all statistical metrics.
 */
export function printDashboard(parsedData, analysisData) {
  const user = parsedData.user || {};
  const cOverview = analysisData.consumption_overview || {};
  const rStats = analysisData.rating_statistics || {};
  const div = analysisData.community_divergence || {};
  const genres = analysisData.genre_analytics || {};
  const studios = analysisData.studio_analytics || {};
  const temporal = analysisData.temporal_and_format_analytics || {};

  // 1. User Header Card
  console.log(c.bold(`╭───────────────────────────────────────────────────────────────────╮`));
  console.log(`│  👤 ${c.bold(c.magenta(user.name.padEnd(20)))}  ${c.dim(`ID: ${String(user.id).padEnd(10)} Score Format: ${user.score_format}`)} │`);
  console.log(c.bold(`╰───────────────────────────────────────────────────────────────────╯`));

  // 2. Consumption Overview
  printSectionHeader("CONSUMPTION & VOLUME METRICS", "📊");
  const time = cOverview.total_time_spent || {};
  console.log(`  • ${c.bold("Total Anime Tracked")}  : ${c.yellow(c.bold(cOverview.total_anime))} titles`);
  console.log(`  • ${c.bold("Total Episodes Watched")}: ${c.yellow(c.bold(cOverview.total_episodes_watched))} episodes`);
  console.log(`  • ${c.bold("Total Time Watched")}    : ${c.green(c.bold(time.days + " days"))} ${c.dim(`(${time.hours} hrs / ${time.minutes} mins)`)}`);
  console.log(`  • ${c.bold("List Completion Rate")}  : ${c.green(c.bold(cOverview.completion_rate_percentage + "%"))} [${createProgressBar(cOverview.completion_rate_percentage, 16)}]`);

  // 3. Status Breakdown
  printSectionHeader("LIST STATUS BREAKDOWN", "📁");
  for (const [st, data] of Object.entries(cOverview.status_breakdown || {})) {
    const label = st.charAt(0).toUpperCase() + st.slice(1);
    const countStr = String(data.count).padStart(4);
    const bar = "█".repeat(Math.round(data.percentage / 4));
    let coloredBar = c.blue(bar);
    if (st === "completed") coloredBar = c.green(bar);
    else if (st === "watching") coloredBar = c.cyan(bar);
    else if (st === "dropped") coloredBar = c.red(bar);
    else if (st === "planning") coloredBar = c.magenta(bar);

    console.log(`  ${label.padEnd(12)} : ${c.bold(countStr)} (${String(data.percentage.toFixed(1)).padStart(5)}%) │ ${coloredBar}`);
  }

  // 4. Rating & Score Analytics
  printSectionHeader("RATING & SCORE ANALYTICS", "🎯");
  console.log(`  • ${"Rated Titles".padEnd(20)}: ${c.bold(rStats.rated_count)} / ${cOverview.total_anime} (${rStats.rated_percentage}%)`);
  console.log(`  • ${"User Mean Score".padEnd(20)}: ${c.bold(c.yellow(rStats.user_mean_score ?? "N/A"))} / 100`);
  console.log(`  • ${"User Median Score".padEnd(20)}: ${c.bold(rStats.user_median_score ?? "N/A")} / 100`);
  console.log(`  • ${"Standard Deviation".padEnd(20)}: ${rStats.user_std_deviation ?? "N/A"}`);
  console.log(`  • ${"Score Range".padEnd(20)}: ${rStats.min_score ?? "N/A"} (Min) ─── ${rStats.max_score ?? "N/A"} (Max)`);
  console.log(`  • ${"Rating Tendency".padEnd(20)}: ${c.bold(c.green(rStats.rating_tendency ?? "N/A"))}`);

  // 5. Score Distribution Tiers
  printSectionHeader("SCORE DISTRIBUTION TIERS", "📈");
  const tiers = rStats.score_distribution_tiers || {};
  const tierConfig = [
    ["masterpiece_90_100", "🏆 Masterpiece", "90 - 100", c.green],
    ["great_80_89",        "🌟 Great      ", "80 - 89 ", c.cyan],
    ["good_70_79",         "👍 Good       ", "70 - 79 ", c.blue],
    ["average_60_69",      "👌 Average    ", "60 - 69 ", c.yellow],
    ["mediocre_50_59",     "😐 Mediocre   ", "50 - 59 ", c.magenta],
    ["poor_below_50",      "👎 Poor       ", " < 50   ", c.red]
  ];

  for (const [key, label, range, colorFn] of tierConfig) {
    const tData = tiers[key] || { count: 0, percentage: 0 };
    const bar = "■".repeat(Math.round(tData.percentage / 4));
    console.log(`  ${label} [${c.dim(range)}] : ${String(tData.count).padStart(4)} (${String(tData.percentage.toFixed(1)).padStart(5)}%) │ ${colorFn(bar)}`);
  }

  // 6. Hot Takes / Community Divergence
  if (div.top_user_higher_than_community?.length > 0) {
    printSectionHeader("PERSONAL HIDDEN GEMS (Loved More Than Community)", "🌟");
    for (const item of div.top_user_higher_than_community.slice(0, 5)) {
      const title = item.title.length > 32 ? item.title.slice(0, 29) + "..." : item.title;
      console.log(`  ★ ${c.bold(title.padEnd(32))} │ My: ${c.bold(c.yellow(item.user_score))} │ Comm: ${item.community_score} │ Delta: ${c.green(c.bold("+" + item.difference))}`);
    }
  }

  if (div.top_user_lower_than_community?.length > 0) {
    printSectionHeader("HARSHEST CRITIQUES (Rated Lower Than Community)", "⚡");
    for (const item of div.top_user_lower_than_community.slice(0, 5)) {
      const title = item.title.length > 32 ? item.title.slice(0, 29) + "..." : item.title;
      console.log(`  ⚡ ${c.bold(title.padEnd(32))} │ My: ${c.bold(c.yellow(item.user_score))} │ Comm: ${item.community_score} │ Delta: ${c.red(c.bold(String(item.difference)))}`);
    }
  }

  // 7. Top Genres
  if (genres.favorite_genres_by_score?.length > 0) {
    printSectionHeader("TOP FAVORITE GENRES (Ranked by Average Score)", "🎭");
    for (const g of genres.favorite_genres_by_score) {
      console.log(`  • ${c.bold(g.genre.padEnd(16))} │ Rated: ${String(g.user_rated_count).padStart(2)} titles │ My Avg: ${c.bold(c.yellow(g.user_mean_score))} │ Comm Avg: ${g.community_mean_score}`);
    }
  }

  // 8. Top Studios
  if (studios.most_watched_studios?.length > 0) {
    printSectionHeader("MOST WATCHED ANIMATION STUDIOS", "🏢");
    for (const s of studios.most_watched_studios.slice(0, 5)) {
      const uAvg = s.user_mean_score !== null ? c.yellow(c.bold(String(s.user_mean_score))) : c.dim("N/A");
      console.log(`  • ${c.bold(s.studio.padEnd(20))} │ Titles: ${String(s.anime_count).padStart(2)} │ Episodes: ${String(s.total_episodes_watched).padStart(4)} │ My Avg: ${uAvg}`);
    }
  }

  console.log(c.dim("\n" + "─".repeat(68)));
}

/**
 * Renders the export summary box showing all generated files.
 */
export function printExportSummary(exportedFiles, outputDir) {
  if (!exportedFiles || exportedFiles.length === 0) return;

  console.log(`\n${c.bold(c.green("╭── 💾 EXPORTED FILES SUCCESS ─────────────────────────────────────"))}`);
  console.log(`│  Destination: ${c.cyan(outputDir)}`);
  console.log(c.dim(`├──${"─".repeat(65)}`));
  for (let i = 0; i < exportedFiles.length; i++) {
    const filename = exportedFiles[i].split(/[\\/]/).pop();
    const ext = filename.split(".").pop().toUpperCase();
    console.log(`│  ${c.bold(`[${ext}]`)} ${c.yellow(filename)}`);
  }
  console.log(c.bold(c.green(`╰───────────────────────────────────────────────────────────────────╯\n`)));
}
