/**
 * Clean, minimalist and aesthetic terminal UI for anifetch.
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
 * Creates a clean visual progress bar: [██████████░░░░] 81.8%
 */
export function createProgressBar(percentage, length = 16) {
  const clamped = Math.max(0, Math.min(100, percentage));
  const filled = Math.round((clamped / 100) * length);
  const empty = length - filled;
  const bar = "█".repeat(filled) + "░".repeat(empty);
  return `${c.green(bar)} ${c.bold(clamped.toFixed(1) + "%")}`;
}

/**
 * Prints a clean, modern aesthetic summary.
 */
export function printDashboard(parsedData, analysisData) {
  const user = parsedData.user || {};
  const cOverview = analysisData.consumption_overview || {};
  const rStats = analysisData.rating_statistics || {};
  const div = analysisData.community_divergence || {};
  const genres = analysisData.genre_analytics || {};
  const studios = analysisData.studio_analytics || {};

  const completed = cOverview.status_breakdown?.completed?.count || 0;
  const watching = cOverview.status_breakdown?.watching?.count || 0;
  const dropped = cOverview.status_breakdown?.dropped?.count || 0;
  const planning = cOverview.status_breakdown?.planning?.count || 0;
  const time = cOverview.total_time_spent || {};

  // Top 3 personal favorites / gems
  const gems = (div.top_user_higher_than_community || [])
    .slice(0, 3)
    .map(i => `${i.title} (${i.user_score})`)
    .join(", ");

  // Top 3 genres
  const topGenres = (genres.favorite_genres_by_score || [])
    .slice(0, 3)
    .map(g => `${g.genre} (${g.user_mean_score})`)
    .join(", ");

  // Top 3 studios
  const topStudios = (studios.most_watched_studios || [])
    .slice(0, 3)
    .map(s => s.studio)
    .join(", ");

  // Score tier highlight
  const masterpieces = rStats.score_distribution_tiers?.masterpiece_90_100?.count || 0;
  const great = rStats.score_distribution_tiers?.great_80_89?.count || 0;

  const header = ` ${user.name} @ AniList `;
  console.log(`\n${c.cyan(c.bold("╭─" + header + "─".repeat(Math.max(2, 54 - header.length)) + "╮"))}`);

  const lines = [
    `${c.bold("Anime".padEnd(12))} : ${c.yellow(c.bold(cOverview.total_anime))} total ${c.dim(`(${completed} completed, ${watching} watching, ${dropped} dropped, ${planning} planning)`)}`,
    `${c.bold("Episodes".padEnd(12))} : ${c.yellow(c.bold(cOverview.total_episodes_watched))} eps ${c.dim(`(~${time.days} days / ${time.hours} hrs)`)}`,
    `${c.bold("Completion".padEnd(12))} : [${createProgressBar(cOverview.completion_rate_percentage, 14)}]`,
    `${c.bold("Mean Score".padEnd(12))} : ${c.bold(c.yellow(rStats.user_mean_score ?? "N/A"))} / 100 ${c.dim(`(median: ${rStats.user_median_score ?? "N/A"} | ${masterpieces} masterpieces, ${great} great)`)}`
  ];

  if (gems) {
    lines.push(`${c.bold("Favorites".padEnd(12))} : ${c.green(gems)}`);
  }
  if (topGenres) {
    lines.push(`${c.bold("Top Genres".padEnd(12))} : ${c.cyan(topGenres)}`);
  }
  if (topStudios) {
    lines.push(`${c.bold("Top Studios".padEnd(12))} : ${c.magenta(topStudios)}`);
  }

  for (const line of lines) {
    console.log(`│  ${line}`);
  }

  console.log(c.cyan(c.bold("╰" + "─".repeat(56) + "╯")));
}

/**
 * Clean export notice.
 */
export function printExportSummary(exportedFiles, outputDir) {
  if (!exportedFiles || exportedFiles.length === 0) return;

  const filenames = exportedFiles.map(f => f.split(/[\\/]/).pop()).join(", ");
  console.log(`\n${c.green("✔")} ${c.bold("Exported:")} ${c.yellow(filenames)} ${c.dim(`-> ${outputDir}`)}\n`);
}
