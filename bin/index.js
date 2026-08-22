#!/usr/bin/env node

/**
 * anifetch CLI executable.
 */
import path from "node:path";
import process from "node:process";
import readline from "node:readline";
import { anifetch } from "../src/index.js";
import { printBanner, printPinkHelp, printExportSummary, c } from "../src/ui.js";

const VERSION = "1.0.0";

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
    version: false,
    interactive: false
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
    } else if (arg === "-i" || arg === "--interactive") {
      options.interactive = true;
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
    // Subcommands: 'fetch <username>' or 'get <username>'
    else if (arg === "fetch" || arg === "get") {
      continue;
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

async function runInteractiveMode() {
  printBanner();
  console.log(`${c.sakura("🌸 For help and CLI options, run:")} ${c.hotPink("anifetch --help")}\n`);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: Boolean(process.stdin.isTTY)
  });

  function ask(query) {
    return new Promise((resolve) => {
      let resolved = false;

      const onKeypress = (str, key) => {
        if (!resolved && key && (key.name === "escape" || str === "\u001b")) {
          resolved = true;
          if (process.stdin.isTTY) {
            process.stdin.removeListener("keypress", onKeypress);
          }
          resolve({ text: null, escaped: true });
        }
      };

      if (process.stdin.isTTY) {
        readline.emitKeypressEvents(process.stdin);
        process.stdin.on("keypress", onKeypress);
      }

      rl.question(query, (ans) => {
        if (!resolved) {
          resolved = true;
          if (process.stdin.isTTY) {
            process.stdin.removeListener("keypress", onKeypress);
          }
          resolve({ text: ans, escaped: false });
        }
      });
    });
  }

  let step = 1; // 1 = username, 2 = format, 3 = status, 4 = execute
  let state = {
    username: "",
    format: "json",
    status: "all",
    extraArgs: {}
  };

  try {
    while (true) {
      if (step === 1) {
        const { text, escaped } = await ask(`${c.hotPink("🌸 Username or command:")} `);
        if (escaped) {
          console.log(`\n${c.sakura("🌸 Exited anifetch. Goodbye!")}\n`);
          break;
        }

        const inputStr = (text || "").trim();
        if (!inputStr) {
          console.log(`\n${c.red("❌ Username cannot be empty. Please enter an AniList username.")}\n`);
          continue;
        }

        const lower = inputStr.toLowerCase();

        // Check if user entered help command
        if (["help", "--help", "-h", "-help", "anifetch help", "anifetch --help", "anifetch -h", "anifetch -help"].includes(lower)) {
          printPinkHelp(VERSION);
          continue;
        }

        // Check if user entered demo command
        if (["demo", "--demo", "-d", "anifetch --demo", "anifetch demo"].includes(lower)) {
          state.username = "demo";
          state.extraArgs = { demo: true };
          step = 2;
          continue;
        }

        // If user pasted a full command line (e.g. "anifetch l1e --completed --csv")
        if (inputStr.startsWith("anifetch ")) {
          const parts = inputStr.slice(9).trim().split(/\s+/);
          const parsed = parseCliArgs(parts);
          if (parsed.help) {
            printPinkHelp(VERSION);
            continue;
          }
          if (parsed.username) {
            state.username = parsed.username;
            state.format = parsed.format || "json";
            state.status = parsed.status || "all";
            state.extraArgs = parsed;
            step = 4;
            continue;
          }
        }

        // Check if user typed "q" or "exit"
        if (lower === "q" || lower === "exit") {
          console.log(`\n${c.sakura("🌸 Exited anifetch. Goodbye!")}\n`);
          break;
        }

        state.username = inputStr;
        step = 2;
      } else if (step === 2) {
        const { text, escaped } = await ask(`${c.hotPink("🌸 Export format")} ${c.dim("[json / csv / txt / md / all] (default: json) [ESC to back]:")} `);
        if (escaped) {
          console.log(`\n${c.dim("↩ Back to username")}\n`);
          step = 1;
          continue;
        }

        const f = (text || "").trim().toLowerCase() || "json";
        state.format = f;
        step = 3;
      } else if (step === 3) {
        const { text, escaped } = await ask(`${c.hotPink("🌸 Filter status")} ${c.dim("[all / completed / watching / dropped / planning] (default: all) [ESC to back]:")} `);
        if (escaped) {
          console.log(`\n${c.dim("↩ Back to format")}\n`);
          step = 2;
          continue;
        }

        const s = (text || "").trim().toLowerCase() || "all";
        state.status = s;
        step = 4;
      } else if (step === 4) {
        const isDemo = state.username === "demo" || state.extraArgs?.demo;
        const targetUser = isDemo ? "AnimeEnthusiast" : state.username;

        console.log(`\n${c.dim("[*]")} Fetching AniList collection for '${c.sakura(targetUser)}'...\n`);

        const outputDir = path.resolve(process.cwd(), "./anifetch-output");

        try {
          const { exportedFiles } = await anifetch(targetUser, {
            demo: isDemo,
            status: state.status,
            format: state.format,
            outputDir,
            ...state.extraArgs
          });

          if (exportedFiles.length > 0) {
            printExportSummary(exportedFiles, outputDir);
          }
        } catch (err) {
          console.error(`\n${c.red("❌ Error:")} ${err.message}`);
          console.log(`${c.sakura("🌸 Please check the spelling and try again.")}\n`);
          step = 1;
          state.extraArgs = {};
          continue;
        }

        const { text: anotherText } = await ask(`${c.hotPink("🌸 Fetch another profile?")} ${c.dim("(y/N):")} `);
        if (anotherText && (anotherText.trim().toLowerCase() === "y" || anotherText.trim().toLowerCase() === "yes")) {
          step = 1;
          state = { username: "", format: "json", status: "all", extraArgs: {} };
          console.log("");
          continue;
        } else {
          console.log(`\n${c.sakura("🌸 All done! Have a great day.")}\n`);
          break;
        }
      }
    }
  } finally {
    rl.close();
  }
}

async function run() {
  const args = process.argv.slice(2);
  const options = parseCliArgs(args);

  if (options.help) {
    printBanner();
    printPinkHelp(VERSION);
    process.exit(0);
  }

  if (options.version) {
    console.log(`anifetch v${VERSION}`);
    process.exit(0);
  }

  // If interactive flag or no arguments provided and in TTY: launch interactive mode!
  if (options.interactive || (args.length === 0 && process.stdin.isTTY)) {
    await runInteractiveMode();
    return;
  }

  if (args.length === 0) {
    printBanner();
    printPinkHelp(VERSION);
    process.exit(0);
  }

  const isDemo = options.demo || options.username === "demo";
  const username = options.username || (isDemo ? "AnimeEnthusiast" : null);

  if (!username && !isDemo) {
    printBanner();
    console.error(`${c.red("❌ Error:")} AniList username is required.\n`);
    console.error(`Usage: ${c.rose("anifetch <username>")} (e.g. ${c.rose("anifetch <username>")} or ${c.rose("anifetch --demo")})\n`);
    console.error(`${c.sakura("🌸 Run 'anifetch --help' to see all options & commands.")}\n`);
    process.exit(1);
  }

  if (!options.quiet && !options.jsonStdout) {
    printBanner();
    if (isDemo) {
      console.log(`${c.dim("[*]")} ${c.sakura("Running in DEMO mode with sample dataset...")}\n`);
    } else {
      console.log(`${c.dim("[*]")} Fetching AniList collection for '${c.sakura(username)}'...\n`);
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
      if (exportedFiles.length > 0) {
        printExportSummary(exportedFiles, outputDir || options.output);
      }
    }
  } catch (err) {
    console.error(`\n${c.red("❌ Error:")} ${err.message}\n`);
    console.error(`${c.sakura("🌸 Run 'anifetch --help' for usage guide.")}\n`);
    process.exit(1);
  }
}

run();
