/**
 * Cron scheduler
 *   - Every hour  : sync stock + prices
 *   - Every day at 03:00 : sync new products + images
 *
 * Run with: node cron.js
 * Keep alive with PM2: pm2 start cron.js --name parts-europe-sync
 */
import "dotenv/config";
import cron from "node-cron";
import { syncStock } from "./sync-stock.js";
import { syncCatalog } from "./sync-catalog.js";
import { logger } from "./lib/logger.js";

let stockRunning = false;
let catalogRunning = false;

// Every hour at :00
cron.schedule("0 * * * *", async () => {
  if (stockRunning) {
    logger.warn("Stock sync already running, skipping this tick");
    return;
  }
  stockRunning = true;
  try {
    await syncStock();
  } finally {
    stockRunning = false;
  }
});

// Every day at 03:00
cron.schedule("0 3 * * *", async () => {
  if (catalogRunning) {
    logger.warn("Catalog sync already running, skipping");
    return;
  }
  catalogRunning = true;
  try {
    await syncCatalog();
  } finally {
    catalogRunning = false;
  }
});

logger.info("Cron scheduler started");
logger.info("  - Stock sync : every hour");
logger.info("  - Catalog sync : daily at 03:00");

// Run immediately on startup so you don't wait for the next tick
(async () => {
  logger.info("Running initial stock sync on startup...");
  await syncStock().catch((e) => logger.error("Initial stock sync failed:", e.message));
})();
