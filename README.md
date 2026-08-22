<div align="center">

```
   █████╗ ███╗   ██╗██╗███████╗███████╗████████╗ ██████╗██╗  ██╗
  ██╔══██╗████╗  ██║██║██╔════╝██╔════╝╚══██╔══╝██╔════╝██║  ██║
  ███████║██╔██╗ ██║██║█████╗  █████╗     ██║   ██║     ███████║
  ██╔══██║██║╚██╗██║██║██╔══╝  ██╔══╝     ██║   ██║     ██╔══██║
  ██║  ██║██║ ╚████║██║██║     ███████╗   ██║   ╚██████╗██║  ██║
  ╚═╝  ╚═╝╚═╝  ╚═══╝╚═╝╚═╝     ╚══════╝   ╚═╝    ╚═════╝╚═╝  ╚═╝
```

# 🌸 anifetch

**Fast AniList Data Fetcher & Multi-Format Exporter (JSON, CSV, TXT, Markdown)**

[![npm version](https://img.shields.io/npm/v/anifetch.svg?color=ff69b4&style=flat-square)](https://www.npmjs.com/package/anifetch)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)
[![Node >= 18](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg?style=flat-square)](https://nodejs.org)
[![Zero Dependencies](https://img.shields.io/badge/dependencies-0-success.svg?style=flat-square)](#)

*Extract, filter, and export your entire AniList anime collection into **JSON**, **CSV** (Excel/Sheets), **TXT**, and **Markdown** with automated rating analysis.*

</div>

---

## ⚡ Instant Run (No Install Needed)

Run directly with `npx`:

```bash
npx anifetch <username>
```

Or install globally:

```bash
npm install -g anifetch
```

---

## 🚀 How to Fetch & Export Data

```bash
# 1. Fetch entire anime list and export to JSON
anifetch <username>

# 2. Export ONLY completed anime to JSON
anifetch <username> --completed --json

# 3. Export all anime into a CSV spreadsheet (Excel / Google Sheets)
anifetch <username> --all --csv

# 4. Export dropped anime to a plain-text report
anifetch <username> --dropped --txt

# 5. Export EVERYTHING into all 4 formats (JSON, CSV, TXT, Markdown) at once
anifetch <username> -f all

# 6. Filter by score: Only anime rated 85+
anifetch <username> --min-score 85 --csv

# 7. Custom output destination folder
anifetch <username> -f all -o ./my-anime-data

# 8. Stream pure JSON to stdout (for piping to jq or scripts)
anifetch <username> --json-stdout | jq .

# 9. Test extraction with built-in demo profile
anifetch --demo
```

---

## 🖥️ Terminal Preview

```text
   █████╗ ███╗   ██╗██╗███████╗███████╗████████╗ ██████╗██╗  ██╗
  ██╔══██╗████╗  ██║██║██╔════╝██╔════╝╚══██╔══╝██╔════╝██║  ██║
  ███████║██╔██╗ ██║██║█████╗  █████╗     ██║   ██║     ███████║
  ██╔══██║██║╚██╗██║██║██╔══╝  ██╔══╝     ██║   ██║     ██╔══██║
  ██║  ██║██║ ╚████║██║██║     ███████╗   ██║   ╚██████╗██║  ██║
  ╚═╝  ╚═╝╚═╝  ╚═══╝╚═╝╚═╝     ╚══════╝   ╚═╝    ╚═════╝╚═╝  ╚═╝
  ⚡ Fast AniList Data Fetcher & Multi-Format Exporter

[*] Fetching AniList collection for '<username>'...
✔ Exported to: ./anifetch-output (<username>_anime_list.json, <username>_deep_analysis.json)

EXAMPLES:
  anifetch <username> --completed --json    Export completed anime to JSON
  anifetch <username> --all --csv           Export all anime to spreadsheet
  anifetch <username> -f all                Export to JSON, CSV, TXT & Markdown

👉 Run 'anifetch --help' to see all options, filters & formats.
```

---

## 📁 Generated Output Formats

| Format | Flag | Output Files | Description |
| :--- | :--- | :--- | :--- |
| **JSON** | `-f json` / `--json` | `<user>_anime_list.json`<br>`<user>_deep_analysis.json` | Clean structured list with all titles, personal scores, progress, tags, studios, and complete metrics. |
| **CSV** | `-f csv` / `--csv` | `<user>_anime_list.csv`<br>`<user>_genre_breakdown.csv`<br>`<user>_studio_breakdown.csv` | Spreadsheets ready for Microsoft Excel, Numbers, or Google Sheets with clean escaping. |
| **TXT** | `-f txt` / `--txt` | `<user>_summary.txt` | Human-readable text report with status breakdowns, score histograms, hot takes, and full ASCII table. |
| **Markdown** | `-f md` / `--md` | `<user>_analysis_report.md` | GitHub-flavored Markdown report with formatted tables and direct AniList anime links. |
| **ALL** | `-f all` | **All 7 files** | Generates all 4 formats simultaneously. |

---

## 🛠️ CLI Options Reference

```text
USAGE:
  anifetch <username> [options]
  npx anifetch <username> [options]

OPTIONS & FLAGS:
  -u, --username <name>    AniList username to fetch (or pass as first argument)
  -s, --status <status>    Filter status: completed, watching, dropped, paused, planning, all (default: all)
  -f, --format <format>    Export format: json, csv, txt, md, all (default: json)
  -o, --output <dir>       Destination folder for files (default: ./anifetch-output)
  -d, --demo               Run test with sample demo profile (no internet required)
  --min-score <number>     Filter anime by minimum rating (e.g. --min-score 80)
  --genre <genre>          Filter anime by genre (e.g. --genre Action)
  --sort <field>           Sort by: score, title, episodes, date, popularity
  --order <asc|desc>       Sort order: asc or desc (default: desc)
  --json-stdout            Output pure JSON to stdout (disables banner and file writes)
  -q, --quiet              Quiet mode (suppress terminal messages)
  -v, --version            Show version number
  -h, --help               Show this help guide

SHORTHAND SWITCHES:
  --completed, --watching, --dropped, --paused, --planning, --all
  --json, --csv, --txt, --md
```

---

## 🧪 Tests

```bash
npm test
```

---

## 📄 License

MIT © [Liyfez](https://github.com/Liyfez)
