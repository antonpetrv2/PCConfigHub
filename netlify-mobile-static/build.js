const fs = require("fs");
const path = require("path");

const sourceDir = path.resolve(__dirname, "../pc-config-hub--mobile/dist");
const publishDir = path.resolve(__dirname, ".next");
const localApiUrl = "http://localhost:3000/api";
const apiUrl = (process.env.EXPO_PUBLIC_API_URL || process.env.API_URL || localApiUrl).replace(/\/$/, "");
const textFileExtensions = new Set([".html", ".js", ".json", ".css", ".map"]);

function copyDir(source, target) {
  fs.mkdirSync(target, { recursive: true });

  for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
    const sourcePath = path.join(source, entry.name);
    const targetPath = path.join(target, entry.name);

    if (entry.isDirectory()) {
      copyDir(sourcePath, targetPath);
    } else {
      fs.copyFileSync(sourcePath, targetPath);
    }
  }
}

function patchFile(filePath) {
  if (!textFileExtensions.has(path.extname(filePath))) {
    return;
  }

  const original = fs.readFileSync(filePath, "utf8");
  const patched = original.split(localApiUrl).join(apiUrl);

  if (patched !== original) {
    fs.writeFileSync(filePath, patched);
    console.log(`Patched API URL in ${path.relative(publishDir, filePath)}`);
  }
}

function patchDir(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const entryPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      patchDir(entryPath);
    } else {
      patchFile(entryPath);
    }
  }
}

if (!fs.existsSync(sourceDir)) {
  throw new Error(`Missing prebuilt Expo output: ${sourceDir}`);
}

fs.rmSync(publishDir, { recursive: true, force: true });
copyDir(sourceDir, publishDir);
patchDir(publishDir);

console.log(`Prepared prebuilt Expo output in .next with API URL: ${apiUrl}`);
