<div align="center">

```
   █████╗ ███╗   ██╗██╗███████╗███████╗████████╗ ██████╗██╗  ██╗
  ██╔══██╗████╗  ██║██║██╔════╝██╔════╝╚══██╔══╝██╔════╝██║  ██║
  ███████║██╔██╗ ██║██║█████╗  █████╗     ██║   ██║     ███████║
  ██╔══██║██║╚██╗██║██║██╔══╝  ██╔══╝     ██║   ██║     ██╔══██║
  ██║  ██║██║ ╚████║██║██║     ███████╗   ██║   ╚██████╗██║  ██║
  ╚═╝  ╚═╝╚═╝  ╚═══╝╚═╝╚═╝     ╚══════╝   ╚═╝    ╚═════╝╚═╝  ╚═╝
```

# 🎌 anifetch

**Fast AniList Profile Parser, Multi-Format Exporter & Deep Taste Analyzer CLI**

[![npm version](https://img.shields.io/npm/v/anifetch.svg?color=cb3837&style=flat-square)](https://www.npmjs.com/package/anifetch)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)
[![Node >= 18](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg?style=flat-square)](https://nodejs.org)
[![Zero Dependencies](https://img.shields.io/badge/dependencies-0-success.svg?style=flat-square)](#)

*Instantly fetch any AniList profile, filter by status, export to **JSON**, **CSV**, **TXT**, and **Markdown**, and uncover deep statistical taste profiles and community hot takes directly in your terminal.*

</div>

---

## 📑 Table of Contents

- [⚡ Instant Demo (Preview UI)](#-instant-demo-preview-ui)
- [📦 Installation](#-installation)
- [🚀 Command-Line Usage & Examples](#-command-line-usage--examples)
- [📁 Supported Export Formats](#-supported-export-formats)
- [📊 Terminal UI Preview](#-terminal-ui-preview)
- [🧠 Deep Taste Analytics Engine](#-deep-taste-analytics-engine)
- [🛠️ CLI Options Reference](#️-cli-options-reference)
- [💻 Programmatic Node.js API](#-programmatic-nodejs-api)
- [🔒 Security & Authentication](#-security--authentication)
- [🧪 Running Tests](#-running-tests)
- [📄 License](#-license)

---

## ⚡ Instant Demo (Preview UI)

Want to see what `anifetch` looks like right now? Run the built-in demo mode (no username or internet needed):

```bash
npx anifetch --demo
```

---

## 📦 Installation

### 1. Run without installing (Recommended)
You can run `anifetch` directly on any machine using `npx`:

```bash
npx anifetch <username>
```

### 2. Install globally
```bash
npm install -g anifetch
```

Then run it anywhere:
```bash
anifetch <username>
```

### 3. Local Project Clone
```bash
git clone https://github.com/Liyfez/Anifetch.git
cd Anifetch
node bin/index.js <username>
```

---

## 🚀 Command-Line Usage & Examples

### 1. Basic Profile Fetch
Fetch any public AniList profile, render the terminal dashboard, and export structured JSON:
```bash
anifetch <username>
```
*(Example: `anifetch l1e`)*

### 2. Filter by List Status
Export only specific lists (`completed`, `watching`, `dropped`, `paused`, `planning`):
```bash
# Export only completed anime to JSON
anifetch <username> --completed --json

# Export watching anime to CSV
anifetch <username> --watching --csv

# Export dropped anime to TXT
anifetch <username> --dropped --txt

# Or use standard flag syntax
anifetch <username> -s completed -f json
```

### 3. Export to Multiple Formats
Generate spreadsheets, reports, and data files simultaneously:
```bash
# Export EVERYTHING to JSON, CSV, TXT, and Markdown all at once!
anifetch <username> -f all

# Export entire anime list as an Excel/Google Sheets ready CSV
anifetch <username> --all --csv

# Export to a custom destination directory
anifetch <username> -f all -o ./my-profile-reports
```

### 4. Advanced Score & Genre Filtering
```bash
# Filter anime rated 85+ and sort by score
anifetch <username> --min-score 85 --sort score

# Filter by genre
anifetch <username> --genre Action --csv

# Sort options: score, title, episodes, date, popularity
anifetch <username> --sort episodes --order desc
```

### 5. Stream Pure JSON to Shell Scripts / Pipelines
Pipe clean JSON directly to tools like `jq` without any banners or UI text:
```bash
anifetch <username> --json-stdout | jq '.analysis.rating_statistics'
```

---

## 📁 Supported Export Formats

When you export your profile, `anifetch` generates dedicated, structured files:

| Format | Command Switch | Output Files | Description |
| :--- | :--- | :--- | :--- |
| **JSON** | `-f json` / `--json` | `<user>_anime_list.json`<br>`<user>_deep_analysis.json` | Full machine-readable dataset including all titles, personal scores, progress, tags, studios, and complete statistical metrics. |
| **CSV** | `-f csv` / `--csv` | `<user>_anime_list.csv`<br>`<user>_genre_breakdown.csv`<br>`<user>_studio_breakdown.csv` | Spreadsheets ready for Microsoft Excel, Apple Numbers, or Google Sheets with clean escaping and formulas. |
| **TXT** | `-f txt` / `--txt` | `<user>_summary.txt` | Human-readable text report with status breakdowns, score histograms, hot takes, and a full ASCII table. |
| **Markdown** | `-f md` / `--md` | `<user>_analysis_report.md` | GitHub-flavored Markdown report with formatted tables, score tiers, and direct AniList anime links. |
| **ALL** | `-f all` | **All 7 files** | Generates all 4 formats in a single command. |

---

## 📊 Terminal UI Preview

```text
   █████╗ ███╗   ██╗██╗███████╗███████╗████████╗ ██████╗██╗  ██╗
  ██╔══██╗████╗  ██║██║██╔════╝██╔════╝╚══██╔══╝██╔════╝██║  ██║
  ███████║██╔██╗ ██║██║█████╗  █████╗     ██║   ██║     ███████║
  ██╔══██║██║╚██╗██║██║██╔══╝  ██╔══╝     ██║   ██║     ██╔══██║
  ██║  ██║██║ ╚████║██║██║     ███████╗   ██║   ╚██████╗██║  ██║
  ╚═╝  ╚═╝╚═╝  ╚═══╝╚═╝╚═╝     ╚══════╝   ╚═╝    ╚═════╝╚═╝  ╚═╝

  ⚡ Fast AniList Profile Parser, Exporter & Deep Taste Analyzer

╭───────────────────────────────────────────────────────────────────╮
│  👤 l1e                   ID: 7346382    Score Format: POINT_100 │
╰───────────────────────────────────────────────────────────────────╯

╭── 📊 CONSUMPTION & VOLUME METRICS ────────────────────────────────
  • Total Anime Tracked  : 199 titles
  • Total Episodes Watched: 2931 episodes
  • Total Time Watched    : 49.57 days (1189.73 hrs / 71384 mins)
  • List Completion Rate  : 91.28% [███████████████░ 91.3%]

╭── 📁 LIST STATUS BREAKDOWN ───────────────────────────────────────
  Completed    :  178 ( 89.5%) │ ██████████████████████
  Watching     :   13 (  6.5%) │ ██
  Dropped      :    4 (  2.0%) │ █
  Planning     :    4 (  2.0%) │ █

╭── 🎯 RATING & SCORE ANALYTICS ────────────────────────────────────
  • Rated Titles        : 180 / 199 (90.45%)
  • User Mean Score     : 90.31 / 100
  • User Median Score   : 90 / 100
  • Standard Deviation  : 8.44
  • Score Range         : 45 (Min) ─── 100 (Max)
  • Rating Tendency     : Generous (+11.73 above community average)

╭── 📈 SCORE DISTRIBUTION TIERS ────────────────────────────────────
  🏆 Masterpiece [90 - 100] :  131 ( 72.8%) │ ■■■■■■■■■■■■■■■■■■
  🌟 Great       [80 - 89 ] :   42 ( 23.3%) │ ■■■■■■
  👍 Good        [70 - 79 ] :    2 (  1.1%) │ 
  👌 Average     [60 - 69 ] :    4 (  2.2%) │ ■
  👎 Poor        [ < 50   ] :    1 (  0.6%) │ 

╭── 🌟 PERSONAL HIDDEN GEMS (Loved More Than Community) ────────────
  ★ Initial D EXTRA STAGE 2          │ My: 98 │ Comm: 71 │ Delta: +27
  ★ MF Ghost                         │ My: 99 │ Comm: 74 │ Delta: +25
  ★ HELLO WORLD                      │ My: 98 │ Comm: 73 │ Delta: +25
  ★ JoJo no Kimyou na Bouken (2000)  │ My: 95 │ Comm: 70 │ Delta: +25

╭── ⚡ HARSHEST CRITIQUES (Rated Lower Than Community) ─────────────
  ⚡ NHK ni Youkoso!                  │ My: 45 │ Comm: 82 │ Delta: -37
  ⚡ Cyberpunk: Edgerunners           │ My: 68 │ Comm: 85 │ Delta: -17
  ⚡ Grand Blue                       │ My: 65 │ Comm: 82 │ Delta: -17

╭── 🎭 TOP FAVORITE GENRES (Ranked by Average Score) ───────────────
  • Horror           │ Rated:  9 titles │ My Avg: 93.44 │ Comm Avg: 79.7
  • Adventure        │ Rated: 52 titles │ My Avg: 92.96 │ Comm Avg: 80.39
  • Fantasy          │ Rated: 29 titles │ My Avg: 92.69 │ Comm Avg: 80.23

╭── 🏢 MOST WATCHED ANIMATION STUDIOS ──────────────────────────────
  • MADHOUSE             │ Titles: 18 │ Episodes:  575 │ My Avg: 92.94
  • Kyoto Animation      │ Titles: 15 │ Episodes:  111 │ My Avg: 87.92
  • Studio Ghibli        │ Titles: 10 │ Episodes:   10 │ My Avg: 96.8
```

---

## 🧠 Deep Taste Analytics Engine

`anifetch` goes far beyond simple listing by performing automated statistical analysis:

1. **Volume & Engagement**:
   - Total episodes watched across all anime (including rewatch multipliers).
   - Watch time accurately converted to minutes, hours, and days.
   - List completion percentage.

2. **Rating Profile & Stringency**:
   - Calculates Mean, Median, Standard Deviation, and full Score Range.
   - Automatically determines whether you are a **Generous**, **Critical**, or **Balanced** reviewer relative to the AniList community average.

3. **Community Hot Takes & Divergences**:
   - **Personal Gems**: Titles you rated significantly higher than the global AniList community ($\ge +10$ delta).
   - **Harshest Judgments**: Titles you scored significantly lower than the community consensus ($\le -10$ delta).

4. **Genre & Studio Insights**:
   - Watch volume, average score, community delta, and completion rate calculated for every individual genre and studio.

5. **Drop Friction Analysis**:
   - Tracks the exact episode and percentage mark at which you drop shows.

---

## 🛠️ CLI Options Reference

```text
USAGE:
  anifetch <username> [options]
  npx anifetch <username> [options]
  anifetch --demo (Preview UI with sample data)

OPTIONS & FLAGS:
  -u, --username <name>    AniList username to fetch (or pass as first argument)
  -s, --status <status>    Filter status: completed, watching, dropped, paused, planning, all (default: all)
  -f, --format <format>    Export format(s): json, csv, txt, md, all (default: json)
  -o, --output <dir>       Directory to save exported files (default: ./anifetch-output)
  -d, --demo               Run with rich sample demo data to test the UI instantly
  --no-export              Display terminal dashboard without writing files to disk
  --min-score <number>     Filter anime with rating >= score (e.g. --min-score 80)
  --genre <genre>          Filter anime by genre (e.g. --genre Action)
  --sort <field>           Sort by: score, title, episodes, date, popularity (default: score)
  --order <asc|desc>       Sort order: asc or desc (default: desc)
  --json-stdout            Output pure JSON to stdout (disables dashboard and file writes)
  -q, --quiet              Quiet mode (suppress terminal banner and dashboard)
  -v, --version            Show version number
  -h, -help, --help        Show this help guide

SHORTHAND SWITCHES:
  --completed              Filter: status = completed
  --watching               Filter: status = watching
  --dropped                Filter: status = dropped
  --paused                 Filter: status = paused
  --planning               Filter: status = planning
  --all                    Filter: status = all (default)
  --json                   Format: json
  --csv                    Format: csv
  --txt                    Format: txt
  --md                     Format: markdown
```

---

## 💻 Programmatic Node.js API

You can easily integrate `anifetch` into your own Node.js backends, Discord/Telegram bots, or web applications:

```javascript
import { anifetch } from "anifetch";

// Fetch and analyze any profile
const result = await anifetch("l1e", {
  status: "completed",
  format: "all",
  outputDir: "./output"
});

console.log("Username:", result.parsed.user.name);
console.log("Total Completed:", result.parsed.total_anime_count);
console.log("Mean Score:", result.analysis.rating_statistics.user_mean_score);
console.log("Top Loved Anime:", result.analysis.community_divergence.top_user_higher_than_community[0]);
console.log("Exported Files:", result.exportedFiles);
```

---

## 🔒 Security & Authentication

- **Zero Secrets**: `anifetch` requires **no private API secrets or credentials**. It securely queries AniList's public GraphQL endpoint.
- **Private Lists**: If you want to fetch your private lists, you can optionally provide an environment variable without modifying code:
  ```bash
  export ANILIST_TOKEN="your_personal_access_token"
  anifetch <username>
  ```

---

## 🧪 Running Tests

Run the built-in automated test suite:

```bash
npm test
```

---

## 📄 License

MIT © [Liyfez](https://github.com/Liyfez)
