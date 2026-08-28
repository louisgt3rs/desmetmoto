import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOG_DIR = path.join(__dirname, "..", "logs");

if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true });

function timestamp() {
  return new Date().toISOString();
}

function logLine(level, ...args) {
  const line = `[${timestamp()}] [${level}] ${args.join(" ")}`;
  console.log(line);

  const date = new Date().toISOString().slice(0, 10);
  fs.appendFileSync(path.join(LOG_DIR, `sync-${date}.log`), line + "\n");
}

export const logger = {
  info: (...args) => logLine("INFO", ...args),
  warn: (...args) => logLine("WARN", ...args),
  error: (...args) => logLine("ERROR", ...args),
  success: (...args) => logLine("OK  ", ...args),
};
