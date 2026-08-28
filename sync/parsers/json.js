/**
 * JSON / REST API parser for Parts Europe supplier feed.
 *
 * ADAPT: update FIELD_MAP and the fetch logic (auth headers, pagination, etc.)
 */
import fetch from "node-fetch";
import fs from "fs";
import "dotenv/config";

const FIELD_MAP = {
  ref: "partNumber",
  name: "description",
  brand: "brand",
  category: "category",
  price: "priceExclVAT",
  stock: "stockQty",
  images: "imageUrls",   // can be array or string
};

function normalize(raw) {
  return {
    supplier_ref: String(raw[FIELD_MAP.ref] || ""),
    name: String(raw[FIELD_MAP.name] || ""),
    brand: String(raw[FIELD_MAP.brand] || ""),
    category: String(raw[FIELD_MAP.category] || ""),
    price: parseFloat(raw[FIELD_MAP.price]) || null,
    stock_quantity: parseInt(raw[FIELD_MAP.stock]) || 0,
    in_stock: parseInt(raw[FIELD_MAP.stock]) > 0,
    image_urls: [].concat(raw[FIELD_MAP.images] || []).filter(Boolean),
  };
}

// Fetch all pages from a paginated REST API
async function fetchAllPages(baseUrl, headers) {
  const results = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const url = `${baseUrl}?page=${page}&limit=200`;
    const res = await fetch(url, { headers });
    if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${url}`);

    const body = await res.json();

    // ADAPT: navigate to the array of products in the response
    const items = [].concat(body?.products || body?.items || body || []);
    results.push(...items);

    // ADAPT: detect last page (adjust to actual pagination format)
    hasMore = items.length === 200;
    page++;
  }

  return results;
}

export async function parseJSON(source) {
  let items;

  if (source && fs.existsSync(source)) {
    // Local file
    items = JSON.parse(fs.readFileSync(source, "utf-8"));
    items = [].concat(items?.products || items?.items || items || []);
  } else {
    // Remote API — uses PARTS_EUROPE_API_URL + optional API key
    const url = process.env.PARTS_EUROPE_API_URL;
    if (!url) throw new Error("PARTS_EUROPE_API_URL not set in .env");

    const headers = {};
    if (process.env.PARTS_EUROPE_API_KEY) {
      headers["Authorization"] = `Bearer ${process.env.PARTS_EUROPE_API_KEY}`;
    }
    if (process.env.PARTS_EUROPE_API_USER) {
      const creds = Buffer.from(
        `${process.env.PARTS_EUROPE_API_USER}:${process.env.PARTS_EUROPE_API_PASS}`
      ).toString("base64");
      headers["Authorization"] = `Basic ${creds}`;
    }

    items = await fetchAllPages(url, headers);
  }

  return items.map(normalize).filter((p) => p.supplier_ref);
}
