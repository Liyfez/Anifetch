/**
 * JSON Exporter for AniList data and deep analysis.
 */
import fs from "node:fs/promises";
import path from "node:path";
import { sanitizeFilename } from "./csv.js";

export async function exportJson(parsedData, analysisData, outputDir, username) {
  await fs.mkdir(outputDir, { recursive: true });

  const safeUsername = sanitizeFilename(username);
  const listPath = path.join(outputDir, `${safeUsername}_anime_list.json`);
  const analysisPath = path.join(outputDir, `${safeUsername}_deep_analysis.json`);

  await fs.writeFile(listPath, JSON.stringify(parsedData, null, 2), "utf-8");
  await fs.writeFile(analysisPath, JSON.stringify(analysisData, null, 2), "utf-8");

  return [listPath, analysisPath];
}
