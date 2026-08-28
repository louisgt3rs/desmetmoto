/**
 * Daily sync: insert new products and sync their images.
 * Existing products are matched by supplier_ref — never duplicated.
 */
import "dotenv/config";
import { supabase } from "./lib/supabase.js";
import { logger } from "./lib/logger.js";
import { loadFeed } from "./feed-loader.js";
import { syncProductImages } from "./lib/imageSync.js";
import { delay } from "./lib/utils.js";

// Map Parts Europe categories to your Supabase category values
const CATEGORY_MAP = {
  "Helmets": "casques",
  "Jackets": "blousons",
  "Pants": "pantalons",
  "Gloves": "gants",
  "Boots": "bottes",
  "Suits": "combinaisons",
  // Add more mappings as needed
};

function mapCategory(raw) {
  return CATEGORY_MAP[raw] || raw?.toLowerCase() || null;
}

export async function syncCatalog() {
  const start = Date.now();
  logger.info("=== CATALOG SYNC START ===");

  let inserted = 0;
  let skipped = 0;
  let errors = 0;

  try {
    const products = await loadFeed();
    logger.info(`Feed loaded: ${products.length} products`);

    // Fetch all existing supplier_refs
    const { data: existing, error: fetchErr } = await supabase
      .from("products")
      .select("supplier_ref")
      .not("supplier_ref", "is", null);

    if (fetchErr) throw fetchErr;

    const existingRefs = new Set((existing || []).map((p) => p.supplier_ref));

    const newProducts = products.filter(
      (p) => p.supplier_ref && !existingRefs.has(p.supplier_ref)
    );

    logger.info(`New products to insert: ${newProducts.length}`);

    for (const product of newProducts) {
      try {
        // Download + upload images
        let image_url = null;
        let images = [];

        if (product.image_urls?.length > 0) {
          const urls = await syncProductImages(product.image_urls);
          image_url = urls[0] || null;
          images = urls;
        }

        const { error } = await supabase.from("products").insert({
          supplier_ref: product.supplier_ref,
          name: product.name,
          brand: product.brand || null,
          category: mapCategory(product.category),
          price: product.price,
          stock_quantity: product.stock_quantity ?? 0,
          in_stock: product.in_stock ?? false,
          image_url,
          images: images.length > 0 ? images : null,
          description: product.description || null,
        });

        if (error) {
          logger.error(`Insert failed for ref=${product.supplier_ref}: ${error.message}`);
          errors++;
        } else {
          logger.success(`Inserted: ${product.name} (${product.supplier_ref})`);
          inserted++;
        }

        await delay(parseInt(process.env.RATE_LIMIT_MS) || 100);
      } catch (err) {
        logger.error(`Error processing ${product.supplier_ref}: ${err.message}`);
        errors++;
      }
    }

    if (newProducts.length === 0) {
      skipped = products.length;
    }
  } catch (err) {
    logger.error("Catalog sync crashed:", err.message);
    errors++;
  }

  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  logger.info(`=== CATALOG SYNC DONE in ${elapsed}s — inserted: ${inserted}, skipped: ${skipped}, errors: ${errors} ===`);
}

if (process.argv[1].endsWith("sync-catalog.js")) {
  syncCatalog().catch((e) => { logger.error(e.message); process.exit(1); });
}
