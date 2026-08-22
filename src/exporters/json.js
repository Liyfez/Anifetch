/**
 * JSON Exporter for AniList data and deep analysis.
 */
import fs from "node:fs/promises";
import path from "node:path";

export async function exportJson(parsedData, analysisData, outputDir, username) {
  await fs.mkdir(outputDir, { recursive: true });

  const listPath = path.join(outputDir, `${username}_anime_list.json`);
  const analysisPath = path.join(outputDir, `${username}_deep_analysis.json`);

  await fs.writeFile(listPath, JSON.stringify(parsedData, null, 2), "utf-8");
  await fs.writeFile(analysisPath, JSON.stringify(analysisData, null, 2), "utf-8");

  return [listPath, analysisPath];
}
