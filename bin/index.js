#!/usr/bin/env node

/**
 * anifetch CLI executable.
 */
import path from "node:path";
import process from "node:process";
import { anifetch } from "../src/index.js";
import { printBanner, printDashboard } from "../src/ui.js";

const VERSION = "1.0.0";

function printHelp() {
  console.log(`
anifetch v${VERSION} - Fast AniList Profile Parser, Exporter & Taste Analyzer

USAGE:
  anifetch [username] [options]
  npx anifetch <username> [options]

EXAMPLES:
  anifetch l1e
  anifetch l1e --completed --json
  anifetch l1e --all --csv
  anifetch l1e -s dropped -f txt -o ./reports
  anifetch l1e -f all
  anifetch l1e --min-score 85 --sort score
  anifetch l1e --json-stdout | jq .

OPTIONS:
  -u, --username <name>     AniList username to parse (or pass as first argument)
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
  -h, --help                Show this help message

SHORTHAND SWITCHES:
  --completed               Shorthand for -s completed
  --watching                Shorthand for -s watching
  --dropped                 Shorthand for -s dropped
  --paused                  Shorthand for -s paused
  --planning                Shorthand for -s planning
  --all                     Shorthand for -s all
  --json                    Shorthand for -f json
  --csv                     Shorthand for -f csv
  --txt                     Shorthand for -f txt
  --md                      Shorthand for -f md
`);
}

function parseCliArgs(args) {
  const options = {
    username: null,
    status: "all",
    format: "json",
    output: "./anifetch-output",
    noExport: false,
    minScore: null,
    genre: null,
    sort: "score",
    order: "desc",
    jsonStdout: false,
    quiet: false,
    help: false,
    version: false
  };

  const positional = [];
  const selectedFormats = new Set();
  const selectedStatuses = new Set();

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === "-h" || arg === "--help") {
      options.help = true;
    } else if (arg === "-v" || arg === "--version") {
      options.version = true;
    } else if (arg === "-q" || arg === "--quiet") {
      options.quiet = true;
    } else if (arg === "--json-stdout") {
      options.jsonStdout = true;
    } else if (arg === "--no-export") {
      options.noExport = true;
    } else if (arg === "-u" || arg === "--username" || arg === "--user") {
      options.username = args[++i];
    } else if (arg === "-s" || arg === "--status" || arg === "--list") {
      options.status = args[++i];
    } else if (arg === "-f" || arg === "--format") {
      options.format = args[++i];
    } else if (arg === "-o" || arg === "--output" || arg === "--out") {
      options.output = args[++i];
    } else if (arg === "--min-score" || arg === "--minscore") {
      options.minScore = Number(args[++i]);
    } else if (arg === "--genre") {
      options.genre = args[++i];
    } else if (arg === "--sort") {
      options.sort = args[++i];
    } else if (arg === "--order") {
      options.order = args[++i];
    }
    // Shorthand status flags
    else if (arg === "--completed") {
      selectedStatuses.add("completed");
    } else if (arg === "--watching") {
      selectedStatuses.add("watching");
    } else if (arg === "--dropped") {
      selectedStatuses.add("dropped");
    } else if (arg === "--paused") {
      selectedStatuses.add("paused");
    } else if (arg === "--planning") {
      selectedStatuses.add("planning");
    } else if (arg === "--all") {
      options.status = "all";
    }
    // Shorthand format flags
    else if (arg === "--json") {
      selectedFormats.add("json");
    } else if (arg === "--csv") {
      selectedFormats.add("csv");
    } else if (arg === "--txt") {
      selectedFormats.add("txt");
    } else if (arg === "--md" || arg === "--markdown") {
      selectedFormats.add("md");
    }
    // Positional argument
    else if (!arg.startsWith("-")) {
      positional.push(arg);
    }
  }

  if (selectedStatuses.size > 0) {
    options.status = Array.from(selectedStatuses).join(",");
  }
  if (selectedFormats.size > 0) {
    options.format = Array.from(selectedFormats).join(",");
  }

  if (!options.username && positional.length > 0) {
    options.username = positional[0];
  }

  return options;
}

async function run() {
  const args = process.argv.slice(2);
  const options = parseCliArgs(args);

  if (options.help) {
    printHelp();
    process.exit(0);
  }

  if (options.version) {
    console.log(`anifetch v${VERSION}`);
    process.exit(0);
  }

  const username = options.username || "l1e";

  if (!options.quiet && !options.jsonStdout) {
    printBanner();
    console.log(`[*] Fetching AniList collection for user: '${username}'...`);
  }

  try {
    const outputDir = options.noExport || options.jsonStdout ? null : path.resolve(process.cwd(), options.output);

    const { parsed, analysis, exportedFiles } = await anifetch(username, {
      status: options.status,
      minScore: options.minScore,
      genre: options.genre,
      sort: options.sort,
      order: options.order,
      format: options.format,
      outputDir: outputDir
    });

    if (options.jsonStdout) {
      console.log(JSON.stringify({ user: parsed.user, list: parsed.all_anime, analysis }, null, 2));
      process.exit(0);
    }

    if (!options.quiet) {
      printDashboard(parsed, analysis);

      if (exportedFiles.length > 0) {
        console.log(`\n[✓] Successfully exported ${exportedFiles.length} file(s) to: ${outputDir}`);
        for (let i = 0; i < exportedFiles.length; i++) {
          console.log(`    ${i + 1}. ${exportedFiles[i]}`);
        }
        console.log("");
      }
    }
  } catch (err) {
    console.error(`\n[!] Error: ${err.message}`);
    process.exit(1);
  }
}

run();
