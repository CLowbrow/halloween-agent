import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { spawnSync } from "node:child_process";
import { runMonsterMakeover } from "./monsterAgent.js";

function openFile(filePath) {
  if (process.platform === "darwin") {
    spawnSync("open", [filePath], { stdio: "inherit" });
  } else if (process.platform === "win32") {
    spawnSync("cmd", ["/c", "start", "", filePath], { shell: true });
  } else {
    spawnSync("xdg-open", [filePath], { stdio: "inherit" });
  }
}

async function main() {
  const [, , providedPath] = process.argv;
  if (!providedPath) {
    console.error("Usage: node index.js <image-file-path>");
    process.exit(1);
  }

  const resolvedPath = path.resolve(process.cwd(), providedPath);
  if (!fs.existsSync(resolvedPath)) {
    console.error(`File not found: ${resolvedPath}`);
    process.exit(1);
  }

  const mimeType = getMimeType(resolvedPath);
  const imageBuffer = fs.readFileSync(resolvedPath);
  const imageBase64 = imageBuffer.toString("base64");
  const imageDataUrl = `data:${mimeType};base64,${imageBase64}`;

  const transformedImageBase64 = await runMonsterMakeover(imageDataUrl);
  const transformedBuffer = Buffer.from(transformedImageBase64, "base64");
  const transformedImagePath = path.join(
    os.tmpdir(),
    `monster-makeover-${Date.now()}.jpeg`
  );
  fs.writeFileSync(transformedImagePath, transformedBuffer);

  console.log(`Opening transformed image: ${transformedImagePath}`);
  openFile(transformedImagePath);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const map = {
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".webp": "image/webp",
    ".gif": "image/gif",
  };
  const mimeType = map[ext];
  if (!mimeType) {
    throw new Error(`Unsupported image type for file: ${filePath}`);
  }
  return mimeType;
}
