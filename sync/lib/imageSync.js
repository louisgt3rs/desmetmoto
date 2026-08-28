import fetch from "node-fetch";
import crypto from "crypto";
import path from "path";
import { supabase } from "./supabase.js";
import { logger } from "./logger.js";

const BUCKET = "product-images";

function urlToFilename(url) {
  const base = path.basename(new URL(url).pathname);
  return base || crypto.createHash("md5").update(url).digest("hex") + ".jpg";
}

async function fileExistsInStorage(filename) {
  const { data } = await supabase.storage.from(BUCKET).list("parts-europe", {
    search: filename,
  });
  return (data || []).some((f) => f.name === filename);
}

async function downloadAndUpload(imageUrl) {
  const filename = urlToFilename(imageUrl);

  if (await fileExistsInStorage(filename)) {
    const { data } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(`parts-europe/${filename}`);
    return data.publicUrl;
  }

  const res = await fetch(imageUrl);
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${imageUrl}`);

  const buffer = await res.arrayBuffer();
  const contentType = res.headers.get("content-type") || "image/jpeg";

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(`parts-europe/${filename}`, Buffer.from(buffer), {
      contentType,
      upsert: false,
    });

  if (error && error.message !== "The resource already exists") {
    throw error;
  }

  const { data } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(`parts-europe/${filename}`);

  logger.info(`Uploaded image: ${filename}`);
  return data.publicUrl;
}

// Upload all images for a product, returns [primaryUrl, ...otherUrls]
export async function syncProductImages(imageUrls = []) {
  const results = [];
  for (const url of imageUrls) {
    try {
      const publicUrl = await downloadAndUpload(url);
      results.push(publicUrl);
    } catch (err) {
      logger.warn(`Image sync failed for ${url}: ${err.message}`);
    }
  }
  return results;
}
