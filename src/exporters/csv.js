/**
 * CSV Exporter for AniList data, genre breakdowns, and studio metrics.
 */
import fs from "node:fs/promises";
import path from "node:path";

export function sanitizeFilename(name) {
  return String(name || "user")
    .replace(/[^a-zA-Z0-9_\-\.]/g, "_")
    .replace(/_+/g, "_");
}

function escapeCsv(val) {
  if (val === null || val === undefined) return "";
  let str = String(val);

  // Prevent CSV Formula Injection in Excel/Google Sheets
  if (/^[=+\-@\t\r]/.test(str)) {
    str = `'${str}`;
  }

  if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r") || str.includes(";")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function exportCsv(parsedData, analysisData, outputDir, username) {
  await fs.mkdir(outputDir, { recursive: true });

  const safeUsername = sanitizeFilename(username);
  const generatedFiles = [];

  // 1. Anime List CSV
  const animeCsvHeaders = [
    "Media ID",
    "Title",
    "English Title",
    "Status",
    "My Rating",
    "Scale (10)",
    "Community Score",
    "Score Delta",
    "Progress",
    "Total Episodes",
    "Completion %",
    "Watch Hours",
    "Format",
    "Release Year",
    "Decade",
    "Main Studio",
    "Genres",
    "Started At",
    "Completed At",
    "AniList URL"
  ];

  const animeRows = [animeCsvHeaders.join(",")];

  for (const item of parsedData.all_anime || []) {
    const row = [
      escapeCsv(item.media_id),
      escapeCsv(item.title.user_preferred),
      escapeCsv(item.title.english || ""),
      escapeCsv(item.status),
      escapeCsv(item.my_rating.is_rated ? item.my_rating.raw : ""),
      escapeCsv(item.my_rating.scale_10 !== null ? item.my_rating.scale_10 : ""),
      escapeCsv(item.community_rating.average_score !== null ? item.community_rating.average_score : ""),
      escapeCsv(item.score_difference !== null ? item.score_difference : ""),
      escapeCsv(item.progress.episodes_watched),
      escapeCsv(item.progress.total_episodes !== null ? item.progress.total_episodes : ""),
      escapeCsv(item.progress.completion_percentage !== null ? item.progress.completion_percentage : ""),
      escapeCsv(item.watch_time.total_hours),
      escapeCsv(item.media_details.format),
      escapeCsv(item.media_details.release_year || ""),
      escapeCsv(item.media_details.decade),
      escapeCsv(item.media_details.main_studio),
      escapeCsv((item.media_details.genres || []).join("; ")),
      escapeCsv(item.dates.started_at || ""),
      escapeCsv(item.dates.completed_at || ""),
      escapeCsv(item.links.site_url)
    ];
    animeRows.push(row.join(","));
  }

  const animeCsvPath = path.join(outputDir, `${safeUsername}_anime_list.csv`);
  await fs.writeFile(animeCsvPath, animeRows.join("\n"), "utf-8");
  generatedFiles.push(animeCsvPath);

  // 2. Genres CSV (if analysis exists)
  if (analysisData?.genre_analytics?.all_genres_breakdown) {
    const genreHeaders = ["Genre", "Anime Count", "Watch Hours", "User Mean Score", "Community Mean Score", "Score Delta", "Completion Rate %", "Drop Rate %"];
    const genreRows = [genreHeaders.join(",")];

    const sortedGenres = Object.entries(analysisData.genre_analytics.all_genres_breakdown)
      .sort((a, b) => b[1].anime_count - a[1].anime_count);

    for (const [g, gd] of sortedGenres) {
      genreRows.push([
        escapeCsv(g),
        escapeCsv(gd.anime_count),
        escapeCsv(gd.total_hours_watched),
        escapeCsv(gd.user_mean_score !== null ? gd.user_mean_score : ""),
        escapeCsv(gd.community_mean_score !== null ? gd.community_mean_score : ""),
        escapeCsv(gd.score_delta !== null ? gd.score_delta : ""),
        escapeCsv(gd.completion_rate),
        escapeCsv(gd.drop_rate)
      ].join(","));
    }

    const genreCsvPath = path.join(outputDir, `${safeUsername}_genre_breakdown.csv`);
    await fs.writeFile(genreCsvPath, genreRows.join("\n"), "utf-8");
    generatedFiles.push(genreCsvPath);
  }

  // 3. Studios CSV (if analysis exists)
  if (analysisData?.studio_analytics?.all_studios_breakdown) {
    const studioHeaders = ["Studio", "Anime Count", "Total Episodes", "User Mean Score", "Community Mean Score", "Score Delta"];
    const studioRows = [studioHeaders.join(",")];

    const sortedStudios = Object.entries(analysisData.studio_analytics.all_studios_breakdown)
      .sort((a, b) => b[1].anime_count - a[1].anime_count);

    for (const [s, sd] of sortedStudios) {
      studioRows.push([
        escapeCsv(s),
        escapeCsv(sd.anime_count),
        escapeCsv(sd.total_episodes_watched),
        escapeCsv(sd.user_mean_score !== null ? sd.user_mean_score : ""),
        escapeCsv(sd.community_mean_score !== null ? sd.community_mean_score : ""),
        escapeCsv(sd.score_delta !== null ? sd.score_delta : "")
      ].join(","));
    }

    const studioCsvPath = path.join(outputDir, `${safeUsername}_studio_breakdown.csv`);
    await fs.writeFile(studioCsvPath, studioRows.join("\n"), "utf-8");
    generatedFiles.push(studioCsvPath);
  }

  return generatedFiles;
}
