/**
 * Generates transparent high-resolution PNG logos with ZERO background / container box.
 */
import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";

const BANNER_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body {
    background: transparent !important;
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 30px;
    font-family: 'Consolas', 'Courier New', 'Fira Code', 'JetBrains Mono', monospace;
  }
  .ascii-art {
    font-size: 28px;
    line-height: 1.15;
    font-weight: 900;
    letter-spacing: 0px;
    white-space: pre;
    background: linear-gradient(135deg, #FF1E82 0%, #FF4B8C 25%, #FF69B4 50%, #FF94B9 75%, #FFD2E1 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    filter: drop-shadow(0 0 12px rgba(255, 45, 117, 0.45));
  }
  .tagline {
    margin-top: 18px;
    font-size: 20px;
    font-weight: 600;
    letter-spacing: 1px;
    color: #FF9EBE;
    text-align: center;
    text-shadow: 0 0 12px rgba(255, 105, 180, 0.35);
  }
</style>
</head>
<body>
  <div class="ascii-art">   █████╗ ███╗   ██╗██╗███████╗███████╗████████╗ ██████╗██╗  ██╗
  ██╔══██╗████╗  ██║██║██╔════╝██╔════╝╚══██╔══╝██╔════╝██║  ██║
  ███████║██╔██╗ ██║██║█████╗  █████╗     ██║   ██║     ███████║
  ██╔══██║██║╚██╗██║██║██╔══╝  ██╔══╝     ██║   ██║     ██╔══██║
  ██║  ██║██║ ╚████║██║██║     ███████╗   ██║   ╚██████╗██║  ██║
  ╚═╝  ╚═╝╚═╝  ╚═══╝╚═╝╚═╝     ╚══════╝   ╚═╝    ╚═════╝╚═╝  ╚═╝</div>
  <div class="tagline">🌸 Fast AniList Data Fetcher & Multi-Format Exporter</div>
</body>
</html>`;

const LOGO_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body {
    background: transparent !important;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    font-family: 'Consolas', 'Courier New', 'Fira Code', 'JetBrains Mono', monospace;
  }
  .ascii-art {
    font-size: 30px;
    line-height: 1.15;
    font-weight: 900;
    letter-spacing: 0px;
    white-space: pre;
    background: linear-gradient(135deg, #FF1E82 0%, #FF4B8C 25%, #FF69B4 50%, #FF94B9 75%, #FFD2E1 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    filter: drop-shadow(0 0 12px rgba(255, 45, 117, 0.45));
  }
</style>
</head>
<body>
  <div class="ascii-art">   █████╗ ███╗   ██╗██╗███████╗███████╗████████╗ ██████╗██╗  ██╗
  ██╔══██╗████╗  ██║██║██╔════╝██╔════╝╚══██╔══╝██╔════╝██║  ██║
  ███████║██╔██╗ ██║██║█████╗  █████╗     ██║   ██║     ███████║
  ██╔══██║██║╚██╗██║██║██╔══╝  ██╔══╝     ██║   ██║     ██╔══██║
  ██║  ██║██║ ╚████║██║██║     ███████╗   ██║   ╚██████╗██║  ██║
  ╚═╝  ╚═╝╚═╝  ╚═══╝╚═╝╚═╝     ╚══════╝   ╚═╝    ╚═════╝╚═╝  ╚═╝</div>
</body>
</html>`;

async function renderHtmlStringToPng(htmlString, outputPngPath, width, height) {
  const tempHtmlPath = path.resolve(process.cwd(), "temp_render.html");
  await fs.writeFile(tempHtmlPath, htmlString, "utf-8");

  const fileUrl = `file:///${tempHtmlPath.replace(/\\/g, "/")}`;

  const args = [
    "--headless",
    "--disable-gpu",
    "--hide-scrollbars",
    `--window-size=${width},${height}`,
    "--default-background-color=00000000",
    "--force-device-scale-factor=2",
    `--screenshot=${path.resolve(outputPngPath)}`,
    fileUrl
  ];

  return new Promise((resolve, reject) => {
    const child = spawn(EDGE_PATH, args);
    child.on("close", async (code) => {
      await fs.unlink(tempHtmlPath).catch(() => {});
      if (code === 0) resolve();
      else reject(new Error(`Edge headless exited with code ${code}`));
    });
  });
}

async function main() {
  const assetsDir = path.resolve(process.cwd(), "assets");
  const docsAssetsDir = path.resolve(process.cwd(), "docs", "assets");

  await fs.mkdir(assetsDir, { recursive: true });
  await fs.mkdir(docsAssetsDir, { recursive: true });

  const logoPng = path.join(assetsDir, "anifetch_logo.png");
  const bannerPng = path.join(assetsDir, "anifetch_banner.png");

  console.log("[*] Rendering 100% transparent ANIFETCH logo PNG (text only)...");
  await renderHtmlStringToPng(LOGO_HTML, logoPng, 1250, 300);
  console.log(`✔ Created: ${logoPng}`);

  console.log("[*] Rendering 100% transparent ANIFETCH banner PNG (text + subheader, NO square container)...");
  await renderHtmlStringToPng(BANNER_HTML, bannerPng, 1250, 360);
  console.log(`✔ Created: ${bannerPng}`);

  // Copy to docs/assets
  await fs.copyFile(logoPng, path.join(docsAssetsDir, "anifetch_logo.png"));
  await fs.copyFile(bannerPng, path.join(docsAssetsDir, "anifetch_banner.png"));
  console.log("✔ Copied to docs/assets/");
}

main().catch(console.error);
