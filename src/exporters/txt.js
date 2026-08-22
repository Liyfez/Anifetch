/**
 * TXT Plain Text Exporter for AniList data and analysis.
 */
import fs from "node:fs/promises";
import path from "node:path";

function pad(str, len, align = "left") {
  const s = String(str || "");
  if (s.length >= len) return s.slice(0, len);
  const diff = len - s.length;
  if (align === "right") return " ".repeat(diff) + s;
  return s + " ".repeat(diff);
}

export async function exportTxt(parsedData, analysisData, outputDir, username) {
  await fs.mkdir(outputDir, { recursive: true });

  const c = analysisData?.consumption_overview || {};
  const r = analysisData?.rating_statistics || {};
  const div = analysisData?.community_divergence || {};
  const genres = analysisData?.genre_analytics || {};
  const studios = analysisData?.studio_analytics || {};

  const lines = [];

  lines.push("================================================================================");
  lines.push(`               ANILIST PROFILE & TASTE REPORT: ${username.toUpperCase()}`);
  lines.push("================================================================================");
  lines.push("");

  // Consumption
  lines.push("--- 1. CONSUMPTION & ENGAGEMENT ---");
  lines.push(`Total Unique Anime : ${c.total_anime || parsedData.total_anime_count}`);
  lines.push(`Total Episodes     : ${c.total_episodes_watched || 0}`);
  lines.push(`Total Watch Time   : ${c.total_time_spent?.days || 0} days (${c.total_time_spent?.hours || 0} hours)`);
  lines.push(`Completion Rate    : ${c.completion_rate_percentage || 0}%`);
  lines.push("");
  lines.push("Status Breakdown:");
  for (const [st, val] of Object.entries(c.status_breakdown || {})) {
    const bar = "#".repeat(Math.round(val.percentage / 4));
    lines.push(`  - ${pad(st.toUpperCase(), 12)}: ${pad(val.count, 4, "right")} (${pad(val.percentage + "%", 6, "right")}) | ${bar}`);
  }
  lines.push("");

  // Ratings
  lines.push("--- 2. RATING & SCORE ANALYTICS ---");
  lines.push(`Rated Titles       : ${r.rated_count || 0} / ${c.total_anime || 0} (${r.rated_percentage || 0}%)`);
  lines.push(`User Mean Score    : ${r.user_mean_score !== null ? r.user_mean_score + " / 100" : "N/A"}`);
  lines.push(`User Median Score  : ${r.user_median_score !== null ? r.user_median_score + " / 100" : "N/A"}`);
  lines.push(`Standard Deviation : ${r.user_std_deviation !== null ? r.user_std_deviation : "N/A"}`);
  lines.push(`Score Range        : ${r.min_score || 0} - ${r.max_score || 0}`);
  lines.push(`Rating Tendency    : ${r.rating_tendency || "N/A"}`);
  lines.push("");
  lines.push("Score Distribution Tiers:");
  const tierLabels = [
    ["masterpiece_90_100", "90-100 (Masterpiece)"],
    ["great_80_89",        "80-89  (Great)      "],
    ["good_70_79",         "70-79  (Good)       "],
    ["average_60_69",      "60-69  (Average)    "],
    ["mediocre_50_59",     "50-59  (Mediocre)   "],
    ["poor_below_50",      "<50    (Poor)       "]
  ];
  for (const [k, lbl] of tierLabels) {
    const tData = r.score_distribution_tiers?.[k] || { count: 0, percentage: 0 };
    const bar = "=".repeat(Math.round(tData.percentage / 4));
    lines.push(`  ${lbl} : ${pad(tData.count, 4, "right")} (${pad(tData.percentage + "%", 6, "right")}) | ${bar}`);
  }
  lines.push("");

  // Hot Takes
  if (div.top_user_higher_than_community?.length > 0) {
    lines.push("--- 3. PERSONAL HIGHEST DIVERGENCES (RATED HIGHER THAN COMMUNITY) ---");
    for (const item of div.top_user_higher_than_community.slice(0, 8)) {
      lines.push(`  * ${pad(item.title, 38)} | My: ${pad(item.user_score, 3, "right")} | Comm: ${pad(item.community_score, 3, "right")} | Delta: +${item.difference}`);
    }
    lines.push("");
  }

  if (div.top_user_lower_than_community?.length > 0) {
    lines.push("--- 4. HARSHEST CRITIQUES (RATED LOWER THAN COMMUNITY) ---");
    for (const item of div.top_user_lower_than_community.slice(0, 8)) {
      lines.push(`  * ${pad(item.title, 38)} | My: ${pad(item.user_score, 3, "right")} | Comm: ${pad(item.community_score, 3, "right")} | Delta: ${item.difference}`);
    }
    lines.push("");
  }

  // Top Genres & Studios
  if (genres.favorite_genres_by_score?.length > 0) {
    lines.push("--- 5. FAVORITE GENRES (BY AVERAGE SCORE) ---");
    for (const g of genres.favorite_genres_by_score) {
      lines.push(`  * ${pad(g.genre, 16)} | Rated: ${pad(g.user_rated_count, 3, "right")} | My Avg: ${pad(g.user_mean_score, 5, "right")} | Comm Avg: ${pad(g.community_mean_score, 5, "right")}`);
    }
    lines.push("");
  }

  if (studios.most_watched_studios?.length > 0) {
    lines.push("--- 6. TOP STUDIOS BY VOLUME ---");
    for (const s of studios.most_watched_studios.slice(0, 8)) {
      const avg = s.user_mean_score !== null ? s.user_mean_score : "N/A";
      lines.push(`  * ${pad(s.studio, 22)} | Titles: ${pad(s.anime_count, 3, "right")} | Episodes: ${pad(s.total_episodes_watched, 4, "right")} | My Avg: ${avg}`);
    }
    lines.push("");
  }

  // Full Anime List
  lines.push("--- 7. ANIME LIST ---");
  lines.push(`${pad("TITLE", 40)} ${pad("STATUS", 11)} ${pad("MY SCORE", 9, "right")} ${pad("PROGRESS", 10, "right")} ${pad("STUDIO", 20)} ${pad("YEAR", 6)}`);
  lines.push("-".repeat(102));

  for (const item of parsedData.all_anime || []) {
    const title = pad(item.title.user_preferred, 40);
    const st = pad(item.status.toUpperCase(), 11);
    const score = pad(item.my_rating.is_rated ? item.my_rating.raw : "-", 9, "right");
    const prog = pad(`${item.progress.episodes_watched}/${item.progress.total_episodes || "?"}`, 10, "right");
    const studio = pad(item.media_details.main_studio, 20);
    const year = pad(item.media_details.release_year || "-", 6);

    lines.push(`${title} ${st} ${score} ${prog} ${studio} ${year}`);
  }

  lines.push("");
  lines.push("================================================================================");
  lines.push("Generated by anifetch CLI (https://github.com/l1e/anifetch)");
  lines.push("================================================================================");

  const txtPath = path.join(outputDir, `${username}_summary.txt`);
  await fs.writeFile(txtPath, lines.join("\n"), "utf-8");

  return [txtPath];
}
