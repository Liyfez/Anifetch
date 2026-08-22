<div align="center">

# 🎌 anifetch

**Fast AniList Profile Parser, Multi-Format Exporter & Deep Taste Analyzer CLI**

[![npm version](https://img.shields.io/npm/v/anifetch.svg?color=cb3837&style=flat-square)](https://www.npmjs.com/package/anifetch)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)
[![Node >= 18](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg?style=flat-square)](https://nodejs.org)
[![Zero Dependencies](https://img.shields.io/badge/dependencies-0-success.svg?style=flat-square)](#)

*Instantly fetch any AniList profile, filter by status, export to **JSON**, **CSV**, **TXT**, and **Markdown**, and uncover deep statistical taste profiles and community hot takes directly in your terminal.*

</div>

---

## ⚡ Instant Run (No Installation Needed)

Run directly with `npx`:

```bash
npx anifetch l1e
```

Or install globally:

```bash
npm install -g anifetch
```

---

## 🚀 Quick Usage Examples

```bash
# 1. Fetch entire profile and export to JSON
anifetch l1e

# 2. Export completed anime to JSON
anifetch l1e --completed --json

# 3. Export all anime to a spreadsheet (CSV)
anifetch l1e --all --csv

# 4. Export dropped anime to plain text report
anifetch l1e --dropped --txt

# 5. Export everything to all formats (JSON, CSV, TXT, Markdown) at once!
anifetch l1e -f all

# 6. Filter by score: Only anime rated 85+
anifetch l1e --min-score 85 --csv

# 7. Custom output folder
anifetch l1e -f all -o ./my-profile-data

# 8. Pipe pure JSON directly to jq or other CLI tools
anifetch l1e --json-stdout | jq '.analysis.rating_statistics'
```

---

## 📊 Terminal Dashboard Preview

```text
========================================================================
       🎌 ANIFETCH: Fast AniList Parser & Deep Taste Analyzer
========================================================================
[*] Fetching AniList collection for user: 'l1e'...

[+] User: l1e (ID: 7346382 | Score Format: POINT_10_DECIMAL)
------------------------------------------------------------------------
Total Anime: 199 | Episodes: 2931 | Watch Time: 49.57 days (1189.73 hrs) | Completion: 91.28%

--- STATUS BREAKDOWN ---
  Completed    :  178 (89.45%) | ######################
  Watching     :   13 ( 6.53%) | ##
  Dropped      :    4 ( 2.01%) | #
  Planning     :    4 ( 2.01%) | #

--- RATING & SCORE ANALYTICS ---
  Rated Titles      : 180 / 199 (90.45%)
  User Mean Score   : 90.31 / 100
  User Median Score : 90 / 100
  Std Deviation     : 8.44
  Score Range       : 45 - 100
  Rating Bias       : Generous (+11.73 above community average)

--- SCORE DISTRIBUTION TIERS ---
  90-100 (Masterpiece) :  131 (72.78%) | ==================
  80-89  (Great)       :   42 (23.33%) | ======
  70-79  (Good)        :    2 ( 1.11%) | 
  60-69  (Average)     :    4 ( 2.22%) | =
  <50    (Poor)        :    1 ( 0.56%) | 

--- TOP HIGHER THAN COMMUNITY (PERSONAL FAVORITES) ---
  * Initial D EXTRA STAGE 2            | My: 98 vs Comm: 71 (Delta: +27)
  * MF Ghost                           | My: 99 vs Comm: 74 (Delta: +25)
  * HELLO WORLD                        | My: 98 vs Comm: 73 (Delta: +25)
  * JoJo no Kimyou na Bouken (2000)    | My: 95 vs Comm: 70 (Delta: +25)
  * Blue Lock VS. U-20 JAPAN           | My: 99 vs Comm: 75 (Delta: +24)

--- TOP LOWER THAN COMMUNITY (HARSH CRITIQUES) ---
  * NHK ni Youkoso!                    | My: 45 vs Comm: 82 (Delta: -37)
  * Cyberpunk: Edgerunners             | My: 68 vs Comm: 85 (Delta: -17)
  * Grand Blue                         | My: 65 vs Comm: 82 (Delta: -17)
  * Eiga Daisuki Pompo-san             | My: 65 vs Comm: 81 (Delta: -16)
```

---

## 📁 Supported Export Formats

| Format | Option | Description | Output Files |
| :--- | :--- | :--- | :--- |
| **JSON** | `-f json` or `--json` | Clean structured list & complete statistical analysis. | `<user>_anime_list.json`<br>`<user>_deep_analysis.json` |
| **CSV** | `-f csv` or `--csv` | Excel/Google Sheets ready CSVs for anime list, genres, and studios. | `<user>_anime_list.csv`<br>`<user>_genre_breakdown.csv`<br>`<user>_studio_breakdown.csv` |
| **TXT** | `-f txt` or `--txt` | Human-readable plain text summary and formatted ASCII table. | `<user>_summary.txt` |
| **Markdown** | `-f md` or `--md` | GitHub-flavored markdown report with tables and clickable links. | `<user>_analysis_report.md` |
| **ALL** | `-f all` | Generates all 4 formats (7 files) in one command. | All of the above |

---

## 🛠️ CLI Options Reference

```text
USAGE:
  anifetch [username] [options]
  npx anifetch <username> [options]

OPTIONS:
  -u, --username <name>     AniList username (or pass as first positional argument)
  -s, --status <status>     Filter list status: completed, watching, dropped, paused, planning, all (default: all)
  -f, --format <format>     Export format(s): json, csv, txt, md, all (default: json)
  -o, --output <dir>        Output directory for exported files (default: ./anifetch-output)
  --no-export               Run analysis and print dashboard without writing files to disk
  --min-score <number>      Filter anime with rating >= score (e.g. --min-score 80)
  --genre <genre>           Filter anime by genre (e.g. --genre Action)
  --sort <field>            Sort by: score, title, episodes, date, popularity (default: score)
  --order <asc|desc>        Sort order: asc or desc (default: desc)
  --json-stdout             Output pure JSON to stdout (disables UI and file writes)
  -q, --quiet               Quiet mode (suppress terminal dashboard)
  -v, --version             Show version number
  -h, --help                Show help message

SHORTHAND SWITCHES:
  --completed               Filter: status = completed
  --watching                Filter: status = watching
  --dropped                 Filter: status = dropped
  --paused                  Filter: status = paused
  --planning                Filter: status = planning
  --all                     Filter: status = all
  --json                    Export format: json
  --csv                     Export format: csv
  --txt                     Export format: txt
  --md                      Export format: md
```

---

## 💻 Programmatic Node.js API

You can also use `anifetch` inside your own Node.js applications:

```javascript
import { anifetch } from "anifetch";

const result = await anifetch("l1e", {
  status: "completed",
  format: "all",
  outputDir: "./output"
});

console.log(`Mean score: ${result.analysis.rating_statistics.user_mean_score}`);
console.log(`Exported files:`, result.exportedFiles);
```

---

## 🧪 Running Tests

```bash
npm test
```

---

## 📄 License

MIT © [Liyfez](https://github.com/Liyfez)
