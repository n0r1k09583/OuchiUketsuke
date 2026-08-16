import { copyFileSync, existsSync } from "node:fs";
import path from "node:path";

const dbPath = path.join("data", "ouchi-uketsuke.db");
const outPath = process.argv[2] || dbPath;

if (!existsSync(dbPath)) {
  console.error("先に backend を起動して data/ouchi-uketsuke.db を作ってください。");
  process.exit(1);
}

copyFileSync(dbPath, outPath);
console.log("copied", dbPath, "->", outPath);
