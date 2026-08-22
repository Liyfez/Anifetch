/**
 * Test suite for anifetch parser, analyzer, exporters, demo mode, and CLI options.
 */
import { test, describe } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";

import { parseAniListCollection, formatDate, getDecade } from "../src/parser.js";
import { AniListAnalyzer } from "../src/analyzer.js";
import { exportJson } from "../src/exporters/json.js";
import { exportCsv } from "../src/exporters/csv.js";
import { exportTxt } from "../src/exporters/txt.js";
import { exportMarkdown } from "../src/exporters/markdown.js";
import { anifetch, MOCK_DEMO_COLLECTION } from "../src/index.js";

const mockRawData = {
  user: {
    id: 12345,
    name: "testuser",
    mediaListOptions: { scoreFormat: "POINT_100" },
    avatar: { large: "https://example.com/avatar.jpg" }
  },
  lists: [
    {
      name: "Completed",
      isCustomList: false,
      status: "COMPLETED",
      entries: [
        {
          id: 1,
          status: "COMPLETED",
          score: 95,
          progress: 24,
          repeat: 1,
          notes: "Masterpiece",
          startedAt: { year: 2022, month: 1, day: 15 },
          completedAt: { year: 2022, month: 1, day: 20 },
          media: {
            id: 101,
            title: {
              userPreferred: "Steins;Gate",
              english: "Steins;Gate",
              romaji: "Steins;Gate"
            },
            format: "TV",
            episodes: 24,
            duration: 24,
            seasonYear: 2011,
            genres: ["Sci-Fi", "Thriller"],
            averageScore: 90,
            studios: { nodes: [{ name: "White Fox" }] }
          }
        },
        {
          id: 2,
          status: "COMPLETED",
          score: 60,
          progress: 12,
          repeat: 0,
          media: {
            id: 102,
            title: { userPreferred: "Generic Fantasy" },
            format: "TV",
            episodes: 12,
            duration: 24,
            seasonYear: 2020,
            genres: ["Fantasy", "Action"],
            averageScore: 75,
            studios: { nodes: [{ name: "A-1 Pictures" }] }
          }
        }
      ]
    },
    {
      name: "Dropped",
      isCustomList: false,
      status: "DROPPED",
      entries: [
        {
          id: 3,
          status: "DROPPED",
          score: 40,
          progress: 3,
          repeat: 0,
          media: {
            id: 103,
            title: { userPreferred: "Bad Show" },
            format: "TV",
            episodes: 24,
            duration: 24,
            seasonYear: 2018,
            genres: ["Action"],
            averageScore: 65,
            studios: { nodes: [{ name: "Studio Deen" }] }
          }
        }
      ]
    }
  ]
};

describe("anifetch parser tests", () => {
  test("formatDate and getDecade helpers", () => {
    assert.equal(formatDate({ year: 2023, month: 5, day: 12 }), "2023-05-12");
    assert.equal(formatDate(null), null);
    assert.equal(getDecade(1995), "1990s");
    assert.equal(getDecade(2024), "2020s");
    assert.equal(getDecade(null), "Unknown");
  });

  test("parseAniListCollection structure and normalizations", () => {
    const parsed = parseAniListCollection(mockRawData);

    assert.equal(parsed.total_anime_count, 3);
    assert.equal(parsed.user.name, "testuser");
    assert.equal(parsed.categorized_by_status.completed.length, 2);
    assert.equal(parsed.categorized_by_status.dropped.length, 1);

    const sg = parsed.all_anime.find(i => i.media_id === 101);
    assert.ok(sg);
    assert.equal(sg.title.user_preferred, "Steins;Gate");
    assert.equal(sg.my_rating.raw, 95);
    assert.equal(sg.my_rating.scale_10, 9.5);
    assert.equal(sg.score_difference, 5);
    assert.equal(sg.media_details.main_studio, "White Fox");
    assert.equal(sg.media_details.decade, "2010s");
  });

  test("status filtering in parser", () => {
    const parsed = parseAniListCollection(mockRawData, { status: "completed" });
    assert.equal(parsed.total_anime_count, 2);
    assert.equal(parsed.all_anime.every(i => i.status === "completed"), true);
  });

  test("minScore filtering in parser", () => {
    const parsed = parseAniListCollection(mockRawData, { minScore: 90 });
    assert.equal(parsed.total_anime_count, 1);
    assert.equal(parsed.all_anime[0].title.user_preferred, "Steins;Gate");
  });
});

describe("anifetch analyzer tests", () => {
  test("statistical calculations (mean, median, divergence, etc.)", () => {
    const parsed = parseAniListCollection(mockRawData);
    const analyzer = new AniListAnalyzer(parsed);
    const analysis = analyzer.analyze();

    assert.equal(analysis.consumption_overview.total_anime, 3);
    // 24 * (1+1) + 12 + 3 = 63 episodes
    assert.equal(analysis.consumption_overview.total_episodes_watched, 63);

    const r = analysis.rating_statistics;
    assert.equal(r.rated_count, 3);
    assert.equal(r.min_score, 40);
    assert.equal(r.max_score, 95);
    assert.equal(r.user_mean_score, 65.0);
    assert.equal(r.user_median_score, 60.0);

    const div = analysis.community_divergence;
    assert.equal(div.top_user_higher_than_community.length, 1);
    assert.equal(div.top_user_higher_than_community[0].title, "Steins;Gate");
    assert.equal(div.top_user_lower_than_community.length, 2);

    const drops = analysis.drop_friction_analytics;
    assert.equal(drops.total_dropped, 1);
    assert.equal(drops.average_dropped_episode, 3);
  });
});

describe("anifetch exporters tests", () => {
  test("exports all formats (JSON, CSV, TXT, MD) to disk", async () => {
    const parsed = parseAniListCollection(mockRawData);
    const analyzer = new AniListAnalyzer(parsed);
    const analysis = analyzer.analyze();

    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "anifetch-test-"));

    try {
      const jsonFiles = await exportJson(parsed, analysis, tmpDir, "testuser");
      const csvFiles = await exportCsv(parsed, analysis, tmpDir, "testuser");
      const txtFiles = await exportTxt(parsed, analysis, tmpDir, "testuser");
      const mdFiles = await exportMarkdown(parsed, analysis, tmpDir, "testuser");

      assert.equal(jsonFiles.length, 2);
      assert.equal(csvFiles.length, 3);
      assert.equal(txtFiles.length, 1);
      assert.equal(mdFiles.length, 1);

      for (const file of [...jsonFiles, ...csvFiles, ...txtFiles, ...mdFiles]) {
        const stat = await fs.stat(file);
        assert.ok(stat.size > 0);
      }
    } finally {
      await fs.rm(tmpDir, { recursive: true, force: true });
    }
  });
});

describe("anifetch demo & library integration", () => {
  test("anifetch runs with demo flag", async () => {
    const res = await anifetch("demo", { demo: true });
    assert.ok(res.parsed);
    assert.ok(res.analysis);
    assert.equal(res.parsed.user.name, "AnimeEnthusiast");
    assert.equal(res.analysis.consumption_overview.total_anime, 12);
  });

  test("anifetch throws when username is missing", async () => {
    await assert.rejects(
      async () => await anifetch(""),
      /AniList username is required/
    );
  });
});
