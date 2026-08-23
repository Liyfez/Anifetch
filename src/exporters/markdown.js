import fs from "node:fs/promises";
import path from "node:path";
import { sanitizeFilename } from "./csv.js";

export async function exportMarkdown(parsedData, analysisData, outputDir, username) {
  await fs.mkdir(outputDir, { recursive: true });

  const safeUsername = sanitizeFilename(username);
  const c = analysisData?.consumption_overview || {};
  const r = analysisData?.rating_statistics || {};
  const div = analysisData?.community_divergence || {};
  const genres = analysisData?.genre_analytics || {};
  const studios = analysisData?.studio_analytics || {};
  const temporal = analysisData?.temporal_and_format_analytics || {};
  const drops = analysisData?.drop_friction_analytics || {};

  const md = [];

  md.push(`# 📊 AniList Profile & Taste Analysis: \`${username}\`\n`);
  md.push(`> Exported with [**anifetch**](https://github.com/l1e/anifetch) on ${new Date().toISOString().split("T")[0]}.\n`);

  // 1. Consumption Overview
  md.push("## 📈 1. Consumption & Overview");
  md.push(`- **Total Distinct Anime in List**: ${c.total_anime || parsedData.total_anime_count}`);
  md.push(`- **Total Episodes Watched**: ${c.total_episodes_watched || 0}`);
  const timeSpent = c.total_time_spent || {};
  md.push(`- **Total Watch Time**: ${timeSpent.days || 0} days (${timeSpent.hours || 0} hours / ${timeSpent.minutes || 0} minutes)`);
  md.push(`- **Completion Rate**: ${c.completion_rate_percentage || 0}%\n`);

  md.push("| Status | Count | Percentage |");
  md.push("| :--- | :--- | :--- |");
  for (const [st, stData] of Object.entries(c.status_breakdown || {})) {
    md.push(`| **${st.charAt(0).toUpperCase() + st.slice(1)}** | ${stData.count} | ${stData.percentage}% |`);
  }
  md.push("\n");

  // 2. Rating & Score Statistics
  md.push("## 🎯 2. Rating & Score Statistics");
  md.push(`- **Rated Anime**: ${r.rated_count || 0} / ${c.total_anime || 0} (${r.rated_percentage || 0}%)`);
  md.push(`- **User Mean Score**: **${r.user_mean_score ?? "N/A"}** / 100`);
  md.push(`- **User Median Score**: **${r.user_median_score ?? "N/A"}** / 100`);
  md.push(`- **Standard Deviation**: ${r.user_std_deviation ?? "N/A"}`);
  md.push(`- **Score Range**: Min ${r.min_score ?? "N/A"} - Max ${r.max_score ?? "N/A"}`);
  md.push(`- **Rating Bias**: ${r.rating_tendency ?? "N/A"}\n`);

  md.push("### Score Distribution Tiers");
  md.push("| Score Tier | Label | Count | % of Rated |");
  md.push("| :--- | :--- | :--- | :--- |");
  const tierNames = {
    masterpiece_90_100: ["90 - 100", "🏆 Masterpiece"],
    great_80_89: ["80 - 89", "🌟 Great"],
    good_70_79: ["70 - 79", "👍 Good"],
    average_60_69: ["60 - 69", "👌 Decent / Average"],
    mediocre_50_59: ["50 - 59", "😐 Mediocre"],
    poor_below_50: ["< 50", "👎 Poor / Bad"]
  };
  for (const [k, [rng, lbl]] of Object.entries(tierNames)) {
    const tData = r.score_distribution_tiers?.[k] || { count: 0, percentage: 0 };
    md.push(`| ${rng} | ${lbl} | ${tData.count} | ${tData.percentage}% |`);
  }
  md.push("\n");

  // 3. Hot Takes & Divergences
  md.push("## 🔥 3. Hot Takes & Community Divergences");
  if (div.community_alignment_correlation !== null && div.community_alignment_correlation !== undefined) {
    md.push(`- **Community Alignment Correlation**: \`${div.community_alignment_correlation}\` (1.0 = aligned, 0 = independent taste)\n`);
  }

  if (div.top_user_higher_than_community?.length > 0) {
    md.push("### 🌟 Loved More Than Community Average (Hidden Gems)");
    md.push("| Title | My Rating | Community Avg | Difference | Status |");
    md.push("| :--- | :--- | :--- | :--- | :--- |");
    for (const item of div.top_user_higher_than_community.slice(0, 8)) {
      md.push(`| [${item.title}](${item.url}) | **${item.user_score}** | ${item.community_score} | **+${item.difference}** | ${item.status} |`);
    }
    md.push("\n");
  }

  if (div.top_user_lower_than_community?.length > 0) {
    md.push("### ⚡ Harshest Judgments (Rated Below Community Average)");
    md.push("| Title | My Rating | Community Avg | Difference | Status |");
    md.push("| :--- | :--- | :--- | :--- | :--- |");
    for (const item of div.top_user_lower_than_community.slice(0, 8)) {
      md.push(`| [${item.title}](${item.url}) | **${item.user_score}** | ${item.community_score} | **${item.difference}** | ${item.status} |`);
    }
    md.push("\n");
  }

  // 4. Genre Breakdown
  md.push("## 🎭 4. Genre Breakdown & Preferences");
  md.push("| Genre | Count | Hours Watched | User Mean | Community Avg | Delta | Completion % |");
  md.push("| :--- | :--- | :--- | :--- | :--- | :--- | :--- |");
  const allG = genres.all_genres_breakdown || {};
  const sortedG = Object.entries(allG).sort((a, b) => b[1].anime_count - a[1].anime_count);
  for (const [g, gd] of sortedG) {
    const uMean = gd.user_mean_score ?? "-";
    const cMean = gd.community_mean_score ?? "-";
    const deltaStr = (gd.score_delta !== null && gd.score_delta > 0) ? `+${gd.score_delta}` : (gd.score_delta ?? "-");
    md.push(`| **${g}** | ${gd.anime_count} | ${gd.total_hours_watched}h | ${uMean} | ${cMean} | ${deltaStr} | ${gd.completion_rate}% |`);
  }
  md.push("\n");

  // 5. Top Animation Studios
  md.push("## 🏢 5. Animation Studios");
  md.push("### Top Studios by Volume");
  md.push("| Studio | Count | Episodes | User Mean | Community Avg |");
  md.push("| :--- | :--- | :--- | :--- | :--- |");
  for (const st of (studios.most_watched_studios || []).slice(0, 8)) {
    const uMean = st.user_mean_score ?? "-";
    const cMean = st.community_mean_score ?? "-";
    md.push(`| **${st.studio}** | ${st.anime_count} | ${st.total_episodes_watched} | ${uMean} | ${cMean} |`);
  }
  md.push("\n");

  // 6. Format & Eras
  md.push("## ⏳ 6. Formats & Release Decades");
  md.push("### Release Decades");
  md.push("| Decade | Anime Count | Total Episodes | User Mean Score |");
  md.push("| :--- | :--- | :--- | :--- |");
  for (const [d, dd] of Object.entries(temporal.by_decade || {})) {
    const uMean = dd.user_mean_score ?? "-";
    md.push(`| **${d}** | ${dd.anime_count} | ${dd.total_episodes} | ${uMean} |`);
  }
  md.push("\n");

  // 7. Dropped Anime
  if (drops.total_dropped > 0) {
    md.push("## 🛑 7. Dropped Anime Breakdown");
    md.push(`- **Total Dropped**: ${drops.total_dropped} (${drops.drop_rate_percentage}% of list)`);
    md.push(`- **Average Drop Episode**: Ep ${drops.average_dropped_episode ?? "N/A"}\n`);
    if (drops.dropped_titles?.length > 0) {
      md.push("| Dropped Title | Ep Watched | User Score | Genres |");
      md.push("| :--- | :--- | :--- | :--- |");
      for (const dt of drops.dropped_titles) {
        const totalEp = dt.total_episodes || "?";
        md.push(`| **${dt.title}** | ${dt.episodes_watched}/${totalEp} | ${dt.user_rating} | ${(dt.genres || []).slice(0, 3).join(", ")} |`);
      }
      md.push("\n");
    }
  }

  const mdPath = path.join(outputDir, `${safeUsername}_analysis_report.md`);
  await fs.writeFile(mdPath, md.join("\n"), "utf-8");

  return [mdPath];
}
