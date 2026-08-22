#!/usr/bin/env node

/**
 * anifetch CLI executable.
 */
import path from "node:path";
import process from "node:process";
import { anifetch } from "../src/index.js";
import { printBanner, printFetchSummary, printExportSummary, c } from "../src/ui.js";

const VERSION = "1.0.0";

function printHelp() {
  console.log(`
${c.bold("USAGE:")}
  ${c.green("anifetch")} ${c.yellow("<username>")} ${c.dim("[options]")}
  ${c.green("npx anifetch")} ${c.yellow("<username>")} ${c.dim("[options]")}

${c.bold("HOW TO FETCH DATA (EXAMPLES):")}
  ${c.dim("# 1. Fetch entire profile and export to JSON")}
  ${c.green("anifetch")} ${c.yellow("l1e")}

  ${c.dim("# 2. Export only completed anime to JSON")}
  ${c.green("anifetch")} ${c.yellow("l1e")} ${c.cyan("--completed --json")}

  ${c.dim("# 3. Export entire anime list as a CSV spreadsheet (Excel / Sheets)")}
  ${c.green("anifetch")} ${c.yellow("l1e")} ${c.cyan("--all --csv")}

  ${c.dim("# 4. Export dropped anime to plain text report")}
  ${c.green("anifetch")} ${c.yellow("l1e")} ${c.cyan("--dropped --txt")}

  ${c.dim("# 5. Export EVERYTHING to all 4 formats (JSON, CSV, TXT, Markdown) at once")}
  ${c.green("anifetch")} ${c.yellow("l1e")} ${c.cyan("-f all")}

  ${c.dim("# 6. Filter by minimum score (e.g. only anime rated 85+)")}
  ${c.green("anifetch")} ${c.yellow("l1e")} ${c.cyan("--min-score 85 --csv")}

  ${c.dim("# 7. Stream pure JSON to stdout (for piping to jq or webhooks)")}
  ${c.green("anifetch")} ${c.yellow("l1e")} ${c.cyan("--json-stdout")} | jq .

  ${c.dim("# 8. Test data extraction with sample demo profile")}
  ${c.green("anifetch")} ${c.magenta("--demo")}

${c.bold("OPTIONS & FLAGS:")}
  ${c.yellow("-u, --username <name>")}    AniList username to fetch (or pass as first argument)
  ${c.yellow("-s, --status <status>")}    Filter status: ${c.dim("completed, watching, dropped, paused, planning, all")} (default: all)
  ${c.yellow("-f, --format <format>")}    Export format: ${c.dim("json, csv, txt, md, all")} (default: json)
  ${c.yellow("-o, --output <dir>")}       Destination folder for files (default: ./anifetch-output)
  ${c.yellow("-d, --demo")}               Run test with sample demo profile (no internet required)
  ${c.yellow("--min-score <number>")}     Filter anime by minimum rating (e.g. --min-score 80)
  ${c.yellow("--genre <genre>")}          Filter anime by genre (e.g. --genre Action)
  ${c.yellow("--sort <field>")}           Sort by: ${c.dim("score, title, episodes, date, popularity")}
  ${c.yellow("--order <asc|desc>")}       Sort order: ${c.dim("asc or desc")} (default: desc)
  ${c.yellow("--json-stdout")}            Output pure JSON to stdout (disables banner and file writes)
  ${c.yellow("-q, --quiet")}              Quiet mode (suppress terminal messages)
  ${c.yellow("-v, --version")}            Show version number
  ${c.yellow("-h, --help")}               Show this help guide

${c.bold("SHORTHAND SWITCHES:")}
  ${c.cyan("--completed")}, ${c.cyan("--watching")}, ${c.cyan("--dropped")}, ${c.cyan("--paused")}, ${c.cyan("--planning")}, ${c.cyan("--all")}
  ${c.cyan("--json")}, ${c.cyan("--csv")}, ${c.cyan("--txt")}, ${c.cyan("--md")}
`);
}

function parseCliArgs(args) {
  const options = {
    username: null,
    status: "all",
    format: "json",
    output: "./anifetch-output",
    demo: false,
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

    if (arg === "-h" || arg === "--help" || arg === "-help" || arg === "help") {
      options.help = true;
    } else if (arg === "-v" || arg === "--version" || arg === "-version") {
      options.version = true;
    } else if (arg === "-d" || arg === "--demo" || arg === "demo") {
      options.demo = true;
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

  if (options.help || args.length === 0) {
    printBanner();
    printHelp();
    process.exit(0);
  }

  if (options.version) {
    console.log(`anifetch v${VERSION}`);
    process.exit(0);
  }

  const isDemo = options.demo || options.username === "demo";
  const username = options.username || (isDemo ? "AnimeEnthusiast" : null);

  if (!username && !isDemo) {
    console.error(`\n${c.red("❌ Error:")} AniList username is required.`);
    console.error(`Usage: ${c.green("anifetch <username>")} (e.g. ${c.green("anifetch l1e")} or ${c.green("anifetch --demo")})`);
    console.error(`Run ${c.cyan("anifetch --help")} for all options.\n`);
    process.exit(1);
  }

  if (!options.quiet && !options.jsonStdout) {
    printBanner();
    if (isDemo) {
      console.log(`[*] ${c.magenta("Running in DEMO mode")} with sample anime dataset...`);
    } else {
      console.log(`[*] Connecting to AniList GraphQL API for user: '${c.cyan(username)}'...`);
    }
  }

  try {
    const outputDir = options.noExport || options.jsonStdout ? null : path.resolve(process.cwd(), options.output);

    const { parsed, analysis, exportedFiles } = await anifetch(username, {
      demo: isDemo,
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
      printFetchSummary(parsed, username);
      if (exportedFiles.length > 0) {
        printExportSummary(exportedFiles, options.output, username);
      }
    }
  } catch (err) {
    console.error(`\n${c.red("❌ Error:")} ${err.message}\n`);
    process.exit(1);
  }
}

run();
