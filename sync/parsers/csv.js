/**
 * CSV parser for Parts Europe supplier feed.
 *
 * ADAPT: update FIELD_MAP with actual column header names.
 * Default delimiter is ";", change if needed.
 */
import { parse } from "csv-parse/sync";
import fs from "fs";

const DELIMITER = ";";

const FIELD_MAP = {
  ref: "PartNumber",
  name: "Description",
  brand: "Brand",
  category: "Category",
  price: "PriceExclVAT",
  stock: "StockQty",
  images: "ImageURL",
};

function normalize(row) {
  return {
    supplier_ref: String(row[FIELD_MAP.ref] || "").trim(),
    name: String(row[FIELD_MAP.name] || "").trim(),
    brand: String(row[FIELD_MAP.brand] || "").trim(),
    category: String(row[FIELD_MAP.category] || "").trim(),
    price: parseFloat(row[FIELD_MAP.price]?.replace(",", ".")) || null,
    stock_quantity: parseInt(row[FIELD_MAP.stock]) || 0,
    in_stock: parseInt(row[FIELD_MAP.stock]) > 0,
    // Images: pipe-separated list in a single cell, or a single URL
    image_urls: (row[FIELD_MAP.images] || "")
      .split("|")
      .map((u) => u.trim())
      .filter(Boolean),
  };
}

export function parseCSV(source) {
  const content = typeof source === "string" && !source.includes("\n")
    ? fs.readFileSync(source, "utf-8")
    : source;

  const rows = parse(content, {
    columns: true,
    delimiter: DELIMITER,
    skip_empty_lines: true,
    trim: true,
    bom: true,
  });

  return rows.map(normalize).filter((p) => p.supplier_ref);
}
