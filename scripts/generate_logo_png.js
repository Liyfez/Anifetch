/**
 * Generates exact high-resolution PNG logos and SVG from the ANIFETCH banner.
 */
import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";

async function renderHtmlToPng(htmlFilePath, outputPngPath, width, height) {
  const fileUrl = `file:///${path.resolve(htmlFilePath).replace(/\\/g, "/")}`;

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
    child.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Edge headless exited with code ${code}`));
    });
  });
}

async function main() {
  const assetsDir = path.resolve(process.cwd(), "assets");
  await fs.mkdir(assetsDir, { recursive: true });

  const transparentHtml = path.join(assetsDir, "render_transparent.html");
  const bannerHtml = path.join(assetsDir, "render_banner.html");

  const logoPng = path.join(assetsDir, "anifetch_logo.png");
  const bannerPng = path.join(assetsDir, "anifetch_banner.png");

  console.log("[*] Rendering exact ANIFETCH logo PNG (transparent background)...");
  await renderHtmlToPng(transparentHtml, logoPng, 1300, 360);
  console.log(`✔ Created: ${logoPng}`);

  console.log("[*] Rendering exact ANIFETCH banner PNG (dark background)...");
  await renderHtmlToPng(bannerHtml, bannerPng, 1400, 480);
  console.log(`✔ Created: ${bannerPng}`);
}

main().catch(console.error);
