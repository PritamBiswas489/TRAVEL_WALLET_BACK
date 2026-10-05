import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// adjust the relative path to wherever this file sits
const MISSING_FILE = path.resolve(__dirname, "../locales/missing-keys.json");

export const translateValue = (i18n, message, fallbackKey, ...args) => {
  const key = message || fallbackKey;
  const catalog = i18n.getCatalog?.() || {};

  if (!Object.prototype.hasOwnProperty.call(catalog, key)) {
    try {
      const existing = fs.existsSync(MISSING_FILE)
        ? JSON.parse(fs.readFileSync(MISSING_FILE, "utf8"))
        : {};
      if (!(key in existing)) {
        existing[key] = key;
        fs.writeFileSync(MISSING_FILE, JSON.stringify(existing, null, 2));
      }
    } catch (e) {
      console.error("Failed to record missing i18n key", e);
    }
  }
  return i18n.__(key, ...args);
};