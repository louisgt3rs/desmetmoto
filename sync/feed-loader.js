/**
 * Central entry point for loading the supplier feed.
 * Set FEED_FORMAT in .env to: "xml", "csv", "json", or "ftp-xml", "ftp-csv"
 * Set FEED_SOURCE to a local file path or remote URL (JSON/REST mode ignores this).
 */
import "dotenv/config";
import fs from "fs";
import fetch from "node-fetch";
import { parseXML } from "./parsers/xml.js";
import { parseCSV } from "./parsers/csv.js";
import { parseJSON } from "./parsers/json.js";
import { logger } from "./lib/logger.js";

async function fetchRemote(url) {
  const headers = {};
  if (process.env.PARTS_EUROPE_API_KEY) {
    headers["Authorization"] = `Bearer ${process.env.PARTS_EUROPE_API_KEY}`;
  } else if (process.env.PARTS_EUROPE_API_USER) {
    const creds = Buffer.from(
      `${process.env.PARTS_EUROPE_API_USER}:${process.env.PARTS_EUROPE_API_PASS}`
    ).toString("base64");
    headers["Authorization"] = `Basic ${creds}`;
  }
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching feed: ${url}`);
  return res.text();
}

export async function loadFeed() {
  const format = (process.env.FEED_FORMAT || "json").toLowerCase();
  const source = process.env.FEED_SOURCE || "";

  logger.info(`Loading feed — format: ${format}, source: ${source || "API"}`);

  let content = source;

  // If source is a URL and format is xml/csv, download it first
  if (source.startsWith("http") && (format === "xml" || format === "csv")) {
    content = await fetchRemote(source);
  }

  switch (format) {
    case "xml":
      return parseXML(content);
    case "csv":
      return parseCSV(content);
    case "json":
      return parseJSON(source || null);
    default:
      throw new Error(`Unknown FEED_FORMAT: ${format}. Use xml, csv, or json.`);
  }
}
