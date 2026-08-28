/**
 * XML parser for Parts Europe supplier feed.
 *
 * ADAPT THIS FILE once you receive the actual feed.
 * The field names below (ref, name, brand, etc.) are placeholders —
 * replace them with the real XML element/attribute names from Parts Europe.
 *
 * Returns: NormalizedProduct[]
 */
import { XMLParser } from "fast-xml-parser";
import fs from "fs";

// Adjust these to match the actual XML structure
const FIELD_MAP = {
  ref: "PartNumber",        // supplier reference / EAN
  name: "Description",
  brand: "Brand",
  category: "Category",
  price: "PriceExclVAT",    // or "PriceInclVAT"
  stock: "StockQty",
  images: "ImageURL",       // can be array or single value
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
    // Images may be a single string or an array of strings
    image_urls: [].concat(raw[FIELD_MAP.images] || []).filter(Boolean),
  };
}

export function parseXML(source) {
  const xml = typeof source === "string" && source.trim().startsWith("<")
    ? source
    : fs.readFileSync(source, "utf-8");

  const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "" });
  const doc = parser.parse(xml);

  // ADAPT: navigate to the repeating product element in the XML tree
  // Example: doc.Catalog.Products.Product — adjust to actual structure
  const items = [].concat(
    doc?.Catalog?.Products?.Product ||
    doc?.products?.product ||
    doc?.items?.item ||
    []
  );

  return items.map(normalize).filter((p) => p.supplier_ref);
}
