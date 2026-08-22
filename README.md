# 🎌 anifetch

> **Fast AniList profile fetcher, multi-format exporter & taste analyzer CLI.**

[![npm version](https://img.shields.io/npm/v/anifetch.svg?color=cb3837&style=flat-square)](https://www.npmjs.com/package/anifetch)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)
[![Node >= 18](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg?style=flat-square)](https://nodejs.org)
[![Zero Dependencies](https://img.shields.io/badge/dependencies-0-success.svg?style=flat-square)](#)

Fetch any AniList profile, filter by status, export to **JSON**, **CSV**, **TXT**, and **Markdown**, and see a clean summary in your terminal.

```text
╭─ l1e @ AniList ───────────────────────────────────────╮
│  Anime        : 199 total (178 completed, 13 watching, 4 dropped, 4 planning)
│  Episodes     : 2931 eps (~49.57 days / 1189.73 hrs)
│  Completion   : [█████████████░ 91.3%]
│  Mean Score   : 90.31 / 100 (median: 90 | 131 masterpieces, 42 great)
│  Favorites    : Initial D EXTRA STAGE 2 (98), MF Ghost (99), HELLO WORLD (98)
│  Top Genres   : Horror (93.44), Adventure (92.96), Fantasy (92.69)
│  Top Studios  : MADHOUSE, Kyoto Animation, A-1 Pictures
╰────────────────────────────────────────────────────────╯

✔ Exported: l1e_anime_list.json, l1e_deep_analysis.json -> ./anifetch-output
```

---

## ⚡ Quick Start

### Run with `npx` (No install needed):
```bash
npx anifetch <username>
```

### Or install globally:
```bash
npm install -g anifetch
```

### Try the instant demo:
```bash
npx anifetch --demo
```

---

## 🚀 Examples

```bash
# 1. Fetch profile & export to JSON
anifetch <username>

# 2. Export only completed anime to JSON
anifetch <username> --completed --json

# 3. Export entire anime list as CSV (spreadsheet)
anifetch <username> --all --csv

# 4. Export dropped anime to plain text report
anifetch <username> --dropped --txt

# 5. Export all 4 formats (JSON, CSV, TXT, Markdown) at once
anifetch <username> -f all

# 6. Filter by minimum score
anifetch <username> --min-score 85 --csv

# 7. Output pure JSON to stdout (for piping to jq)
anifetch <username> --json-stdout | jq .
```

---

## 📁 Export Formats

| Format | Flag | Output Files | Description |
| :--- | :--- | :--- | :--- |
| **JSON** | `-f json` / `--json` | `<user>_anime_list.json`<br>`<user>_deep_analysis.json` | Clean structured list with all titles, personal scores, progress, tags, studios, and full metrics. |
| **CSV** | `-f csv` / `--csv` | `<user>_anime_list.csv`<br>`<user>_genre_breakdown.csv`<br>`<user>_studio_breakdown.csv` | Excel/Google Sheets ready spreadsheets for anime library, genre metrics, and studio performance. |
| **TXT** | `-f txt` / `--txt` | `<user>_summary.txt` | Human-readable text report with status breakdowns, score histograms, hot takes, and full ASCII table. |
| **Markdown** | `-f md` / `--md` | `<user>_analysis_report.md` | GitHub-flavored Markdown report with formatted tables and direct AniList links. |
| **ALL** | `-f all` | **All 7 files** | Generates all 4 formats simultaneously. |

---

## 🛠️ CLI Options

```text
USAGE:
  anifetch <username> [options]
  npx anifetch <username> [options]

OPTIONS:
  -u, --username <name>    AniList username (or pass as first argument)
  -s, --status <status>    Filter list: completed, watching, dropped, paused, planning, all (default: all)
  -f, --format <format>    Export format: json, csv, txt, md, all (default: json)
  -o, --output <dir>       Output folder (default: ./anifetch-output)
  -d, --demo               Run instant preview with sample data
  --no-export              Display stats without saving files
  --min-score <number>     Filter anime with rating >= score
  --genre <genre>          Filter anime by genre
  --sort <field>           Sort by: score, title, episodes, date, popularity
  --json-stdout            Output pure JSON to stdout
  -q, --quiet              Quiet mode
  -v, --version            Show version
  -h, --help               Show help guide

SHORTHANDS:
  --completed, --watching, --dropped, --planning, --all
  --json, --csv, --txt, --md
```

---

## 💻 Programmatic API

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

## 🧪 Tests

```bash
npm test
```

---

## 📄 License

MIT © [Liyfez](https://github.com/Liyfez)
