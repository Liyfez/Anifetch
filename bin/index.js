#!/usr/bin/env node

/**
 * anifetch CLI executable.
 */
import path from "node:path";
import process from "node:process";
import { anifetch } from "../src/index.js";
import { printDashboard, printExportSummary, c } from "../src/ui.js";

const VERSION = "1.0.0";

function printHelp() {
  console.log(`
${c.bold(c.cyan("anifetch"))} ${c.dim(`v${VERSION}`)} - Fast AniList profile fetcher, parser & exporter

${c.bold("USAGE:")}
  ${c.green("anifetch")} ${c.yellow("<username>")} ${c.dim("[options]")}
  ${c.green("npx anifetch")} ${c.yellow("<username>")} ${c.dim("[options]")}

${c.bold("EXAMPLES:")}
  anifetch ${c.yellow("l1e")}
  anifetch ${c.yellow("l1e")} ${c.cyan("--completed --json")}
  anifetch ${c.yellow("l1e")} ${c.cyan("--all --csv")}
  anifetch ${c.yellow("l1e")} ${c.cyan("-s dropped -f txt")}
  anifetch ${c.yellow("l1e")} ${c.cyan("-f all")}
  anifetch ${c.yellow("l1e")} ${c.cyan("--min-score 85")}
  anifetch ${c.magenta("--demo")}

${c.bold("OPTIONS:")}
  ${c.yellow("-u, --username <name>")}    AniList username (or pass as first argument)
  ${c.yellow("-s, --status <status>")}    Filter list: ${c.dim("completed, watching, dropped, paused, planning, all")} (default: all)
  ${c.yellow("-f, --format <format>")}    Export format: ${c.dim("json, csv, txt, md, all")} (default: json)
  ${c.yellow("-o, --output <dir>")}       Output folder (default: ./anifetch-output)
  ${c.yellow("-d, --demo")}               Run instant preview with sample data
  ${c.yellow("--no-export")}              Display stats without saving files
  ${c.yellow("--min-score <number>")}     Filter anime with rating >= score
  ${c.yellow("--genre <genre>")}          Filter anime by genre
  ${c.yellow("--sort <field>")}           Sort by: ${c.dim("score, title, episodes, date, popularity")}
  ${c.yellow("--json-stdout")}            Output pure JSON to stdout
  ${c.yellow("-q, --quiet")}              Quiet mode
  ${c.yellow("-v, --version")}            Show version
  ${c.yellow("-h, --help")}               Show help guide

${c.bold("SHORTHANDS:")}
  ${c.cyan("--completed")}, ${c.cyan("--watching")}, ${c.cyan("--dropped")}, ${c.cyan("--planning")}, ${c.cyan("--all")}
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
    console.error(`\n${c.red("Error:")} AniList username is required.`);
    console.error(`Usage: anifetch <username> (e.g. anifetch l1e or anifetch --demo)\n`);
    process.exit(1);
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
      printDashboard(parsed, analysis);
      if (exportedFiles.length > 0) {
        printExportSummary(exportedFiles, options.output);
      }
    }
  } catch (err) {
    console.error(`\n${c.red("Error:")} ${err.message}\n`);
    process.exit(1);
  }
}

run();
