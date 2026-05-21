const fs = require("fs");
const path = require("path");

const distDir = path.resolve(__dirname, "../pc-config-hub--mobile/dist");
const localApiUrl = "http://localhost:3000/api";
const apiUrl = (process.env.EXPO_PUBLIC_API_URL || process.env.API_URL || localApiUrl).replace(/\/$/, "");

const textFileExtensions = new Set([".html", ".js", ".json", ".css", ".map"]);

function patchFile(filePath) {
  if (!textFileExtensions.has(path.extname(filePath))) {
    return;
  }

  const original = fs.readFileSync(filePath, "utf8");
  const patched = original.split(localApiUrl).join(apiUrl);

  if (patched !== original) {
    fs.writeFileSync(filePath, patched);
    console.log(`Patched API URL in ${path.relative(distDir, filePath)}`);
  }
}

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const entryPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(entryPath);
    } else {
      patchFile(entryPath);
    }
  }
}

if (!fs.existsSync(distDir)) {
  throw new Error(`Missing prebuilt Expo output: ${distDir}`);
}

walk(distDir);
console.log(`Publishing prebuilt Expo output with API URL: ${apiUrl}`);
