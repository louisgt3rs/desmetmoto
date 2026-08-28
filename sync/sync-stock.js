/**
 * Hourly sync: update stock_quantity, in_stock, and price
 * for all products that already exist in the database.
 * Does NOT insert new products or download images (see sync-catalog.js).
 */
import "dotenv/config";
import { supabase } from "./lib/supabase.js";
import { logger } from "./lib/logger.js";
import { loadFeed } from "./feed-loader.js";
import { delay } from "./lib/utils.js";

const BATCH_SIZE = 50;

export async function syncStock() {
  const start = Date.now();
  logger.info("=== STOCK SYNC START ===");

  let updated = 0;
  let skipped = 0;
  let errors = 0;

  try {
    const products = await loadFeed();
    logger.info(`Feed loaded: ${products.length} products`);

    // Load existing supplier_refs from DB to avoid unnecessary updates
    const { data: existing, error: fetchErr } = await supabase
      .from("products")
      .select("id, supplier_ref, stock_quantity, in_stock, price")
      .not("supplier_ref", "is", null);

    if (fetchErr) throw fetchErr;

    const existingMap = new Map(existing.map((p) => [p.supplier_ref, p]));

    // Process in batches
    for (let i = 0; i < products.length; i += BATCH_SIZE) {
      const batch = products.slice(i, i + BATCH_SIZE);

      const toUpdate = batch
        .filter((p) => existingMap.has(p.supplier_ref))
        .map((p) => {
          const db = existingMap.get(p.supplier_ref);
          // Skip if nothing changed
          if (
            db.stock_quantity === p.stock_quantity &&
            db.in_stock === p.in_stock &&
            db.price === p.price
          ) {
            skipped++;
            return null;
          }
          return {
            id: db.id,
            stock_quantity: p.stock_quantity,
            in_stock: p.in_stock,
            price: p.price,
            updated_at: new Date().toISOString(),
          };
        })
        .filter(Boolean);

      for (const row of toUpdate) {
        const { error } = await supabase
          .from("products")
          .update({
            stock_quantity: row.stock_quantity,
            in_stock: row.in_stock,
            price: row.price,
            updated_at: row.updated_at,
          })
          .eq("id", row.id);

        if (error) {
          logger.error(`Update failed for id=${row.id}: ${error.message}`);
          errors++;
        } else {
          updated++;
        }

        // Respect rate limit
        await delay(parseInt(process.env.RATE_LIMIT_MS) || 50);
      }

      logger.info(`Batch ${Math.floor(i / BATCH_SIZE) + 1}: ${toUpdate.length} updates`);
    }
  } catch (err) {
    logger.error("Stock sync crashed:", err.message);
    errors++;
  }

  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  logger.info(`=== STOCK SYNC DONE in ${elapsed}s — updated: ${updated}, skipped: ${skipped}, errors: ${errors} ===`);
}

// Allow running directly: node sync-stock.js
if (process.argv[1].endsWith("sync-stock.js")) {
  syncStock().catch((e) => { logger.error(e.message); process.exit(1); });
}
