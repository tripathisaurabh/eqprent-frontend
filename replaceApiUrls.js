import fs from "fs";
import path from "path";

const FRONTEND_DIR = "./app"; // 👈 update only inside the app folder
const SEARCH = /http:\/\/localhost:5001/g;
const REPLACE = "${API_BASE_URL}";

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, "utf-8");
  if (SEARCH.test(content)) {
    content = content.replace(SEARCH, REPLACE);
    fs.writeFileSync(filePath, content, "utf-8");
    console.log("✅ Updated:", filePath);
  }
}

function walkDir(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const entryPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkDir(entryPath);
    } else if (entry.name.endsWith(".js") || entry.name.endsWith(".jsx")) {
      replaceInFile(entryPath);
    }
  }
}

walkDir(FRONTEND_DIR);
console.log("✨ All localhost URLs replaced with ${API_BASE_URL}");
