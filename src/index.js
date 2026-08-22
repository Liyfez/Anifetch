/**
 * Programmatic Node.js library API for anifetch.
 */
import { fetchAniListCollection } from "./api.js";
import { parseAniListCollection } from "./parser.js";
import { AniListAnalyzer } from "./analyzer.js";
import { exportJson } from "./exporters/json.js";
import { exportCsv } from "./exporters/csv.js";
import { exportTxt } from "./exporters/txt.js";
import { exportMarkdown } from "./exporters/markdown.js";

/**
 * Fetches, parses, analyzes and optionally exports AniList profile data.
 * @param {string} username - AniList username
 * @param {object} [options] - Configuration & export options
 * @returns {Promise<{parsed: object, analysis: object, exportedFiles: string[]}>}
 */
export async function anifetch(username, options = {}) {
  if (!username) {
    throw new Error("AniList username is required.");
  }

  // 1. Fetch
  const rawCollection = await fetchAniListCollection(username, options);

  // 2. Parse & filter
  const parsed = parseAniListCollection(rawCollection, {
    status: options.status,
    minScore: options.minScore,
    genre: options.genre,
    sort: options.sort,
    order: options.order
  });

  // 3. Analyze
  const analyzer = new AniListAnalyzer(parsed);
  const analysis = analyzer.analyze();

  // 4. Export
  const exportedFiles = [];
  if (options.outputDir) {
    const formats = Array.isArray(options.format)
      ? options.format
      : (options.format || "json").split(",").map(f => f.trim().toLowerCase());

    const isAll = formats.includes("all");

    if (isAll || formats.includes("json")) {
      const files = await exportJson(parsed, analysis, options.outputDir, username);
      exportedFiles.push(...files);
    }
    if (isAll || formats.includes("csv")) {
      const files = await exportCsv(parsed, analysis, options.outputDir, username);
      exportedFiles.push(...files);
    }
    if (isAll || formats.includes("txt")) {
      const files = await exportTxt(parsed, analysis, options.outputDir, username);
      exportedFiles.push(...files);
    }
    if (isAll || formats.includes("md") || formats.includes("markdown")) {
      const files = await exportMarkdown(parsed, analysis, options.outputDir, username);
      exportedFiles.push(...files);
    }
  }

  return { parsed, analysis, exportedFiles };
}

export {
  fetchAniListCollection,
  parseAniListCollection,
  AniListAnalyzer,
  exportJson,
  exportCsv,
  exportTxt,
  exportMarkdown
};
