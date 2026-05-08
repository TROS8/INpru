import path from "node:path";
import { readJsonObject, writeJsonFile } from "../../../shared/json-files.js";

export function nextQuoteIdentity({ counterPath, quotesRoot, folderDate, fs }) {
  const counter = readJsonObject(counterPath);
  const number = Number(counter.nextQuoteNumber || 1);
  const prefix = counter.prefix || "QUOTE";
  const padding = Number(counter.padding || 4);

  const quoteNumber = `${prefix}-${String(number).padStart(padding, "0")}`;

  counter.nextQuoteNumber = number + 1;
  counter.updatedAt = new Date().toISOString();
  writeJsonFile(counterPath, counter);

  const dateFolder = folderDate;
  const quoteDir = path.join(quotesRoot, dateFolder);
  if (!fs.existsSync(quoteDir)) {
    fs.mkdirSync(quoteDir, { recursive: true });
  }

  const quotePath = path.join(quoteDir, `${quoteNumber}.json`);

  return { quoteNumber, quotePath, dateFolder };
}
