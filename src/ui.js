/**
 * Terminal UI rendering with colors, ASCII bars, and statistics dashboards.
 */

// Simple ANSI color helpers (supports NO_COLOR / dumb terminals)
const useColor = !process.env.NO_COLOR && process.stdout.isTTY !== false;

const c = {
  bold: (s) => (useColor ? `\x1b[1m${s}\x1b[0m` : s),
  dim: (s) => (useColor ? `\x1b[2m${s}\x1b[0m` : s),
  cyan: (s) => (useColor ? `\x1b[36m${s}\x1b[0m` : s),
  green: (s) => (useColor ? `\x1b[32m${s}\x1b[0m` : s),
  yellow: (s) => (useColor ? `\x1b[33m${s}\x1b[0m` : s),
  red: (s) => (useColor ? `\x1b[31m${s}\x1b[0m` : s),
  magenta: (s) => (useColor ? `\x1b[35m${s}\x1b[0m` : s),
  blue: (s) => (useColor ? `\x1b[34m${s}\x1b[0m` : s)
};

export function printBanner() {
  console.log(c.cyan(c.bold(`
========================================================================
       🎌 ANIFETCH: Fast AniList Parser & Deep Taste Analyzer
========================================================================`)));
}

export function printDashboard(parsedData, analysisData) {
  const user = parsedData.user || {};
  const cOverview = analysisData.consumption_overview || {};
  const rStats = analysisData.rating_statistics || {};
  const div = analysisData.community_divergence || {};
  const genres = analysisData.genre_analytics || {};
  const studios = analysisData.studio_analytics || {};

  console.log(`\n${c.bold("[+] User:")} ${c.cyan(user.name)} ${c.dim(`(ID: ${user.id} | Score Format: ${user.score_format})`)}`);
  console.log(c.dim("-".repeat(72)));

  // Overview
  const time = cOverview.total_time_spent || {};
  console.log(`${c.bold("Total Anime:")} ${c.yellow(cOverview.total_anime)} | ${c.bold("Episodes:")} ${c.yellow(cOverview.total_episodes_watched)} | ${c.bold("Watch Time:")} ${c.green(time.days + " days")} ${c.dim(`(${time.hours} hrs)`)} | ${c.bold("Completion:")} ${c.green(cOverview.completion_rate_percentage + "%")}`);

  // Status Breakdown
  console.log(`\n${c.bold(c.cyan("--- STATUS BREAKDOWN ---"))}`);
  for (const [st, data] of Object.entries(cOverview.status_breakdown || {})) {
    const bar = "#".repeat(Math.round(data.percentage / 4));
    const label = st.charAt(0).toUpperCase() + st.slice(1);
    console.log(`  ${label.padEnd(12)} : ${String(data.count).padStart(4)} (${String(data.percentage).padStart(5)}%) | ${c.magenta(bar)}`);
  }

  // Rating Stats
  console.log(`\n${c.bold(c.cyan("--- RATING & SCORE ANALYTICS ---"))}`);
  console.log(`  ${"Rated Titles".padEnd(18)}: ${rStats.rated_count} / ${cOverview.total_anime} (${rStats.rated_percentage}%)`);
  console.log(`  ${"User Mean Score".padEnd(18)}: ${c.bold(c.yellow(rStats.user_mean_score))} / 100`);
  console.log(`  ${"User Median Score".padEnd(18)}: ${rStats.user_median_score} / 100`);
  console.log(`  ${"Std Deviation".padEnd(18)}: ${rStats.user_std_deviation}`);
  console.log(`  ${"Score Range".padEnd(18)}: ${rStats.min_score} - ${rStats.max_score}`);
  console.log(`  ${"Rating Bias".padEnd(18)}: ${c.green(rStats.rating_tendency)}`);

  // Score Tiers
  console.log(`\n${c.bold(c.cyan("--- SCORE DISTRIBUTION TIERS ---"))}`);
  const tiers = rStats.score_distribution_tiers || {};
  const labels = [
    ["masterpiece_90_100", "90-100 (Masterpiece)"],
    ["great_80_89",        "80-89  (Great)      "],
    ["good_70_79",         "70-79  (Good)       "],
    ["average_60_69",      "60-69  (Average)    "],
    ["mediocre_50_59",     "50-59  (Mediocre)   "],
    ["poor_below_50",      "<50    (Poor)       "]
  ];
  for (const [k, lbl] of labels) {
    const tData = tiers[k] || { count: 0, percentage: 0 };
    const bar = "=".repeat(Math.round(tData.percentage / 4));
    console.log(`  ${lbl} : ${String(tData.count).padStart(4)} (${String(tData.percentage).padStart(5)}%) | ${c.blue(bar)}`);
  }

  // Hot Takes
  if (div.top_user_higher_than_community?.length > 0) {
    console.log(`\n${c.bold(c.green("--- TOP HIGHER THAN COMMUNITY (PERSONAL FAVORITES) ---"))}`);
    for (const item of div.top_user_higher_than_community.slice(0, 5)) {
      const title = item.title.length > 34 ? item.title.slice(0, 31) + "..." : item.title;
      console.log(`  * ${title.padEnd(34)} | My: ${c.bold(c.yellow(item.user_score))} vs Comm: ${item.community_score} (Delta: ${c.green("+" + item.difference)})`);
    }
  }

  if (div.top_user_lower_than_community?.length > 0) {
    console.log(`\n${c.bold(c.red("--- TOP LOWER THAN COMMUNITY (HARSH CRITIQUES) ---"))}`);
    for (const item of div.top_user_lower_than_community.slice(0, 5)) {
      const title = item.title.length > 34 ? item.title.slice(0, 31) + "..." : item.title;
      console.log(`  * ${title.padEnd(34)} | My: ${c.bold(c.yellow(item.user_score))} vs Comm: ${item.community_score} (Delta: ${c.red(String(item.difference))})`);
    }
  }

  // Top Genres
  if (genres.favorite_genres_by_score?.length > 0) {
    console.log(`\n${c.bold(c.cyan("--- TOP GENRES (BY AVERAGE SCORE) ---"))}`);
    for (const g of genres.favorite_genres_by_score) {
      console.log(`  * ${g.genre.padEnd(16)} | Rated: ${String(g.user_rated_count).padStart(2)} | My Avg: ${c.bold(c.yellow(g.user_mean_score))} | Comm Avg: ${g.community_mean_score}`);
    }
  }

  // Top Studios
  if (studios.most_watched_studios?.length > 0) {
    console.log(`\n${c.bold(c.cyan("--- TOP STUDIOS (BY VOLUME) ---"))}`);
    for (const s of studios.most_watched_studios.slice(0, 5)) {
      const uAvg = s.user_mean_score !== null ? c.yellow(String(s.user_mean_score)) : c.dim("N/A");
      console.log(`  * ${s.studio.padEnd(20)} | Titles: ${String(s.anime_count).padStart(2)} | Episodes: ${String(s.total_episodes_watched).padStart(4)} | My Avg: ${uAvg}`);
    }
  }

  console.log(c.dim("-".repeat(72)));
}
