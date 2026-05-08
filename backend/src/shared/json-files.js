import fs from "node:fs";

export function readJsonObject(filePath) {
  const raw = stripBom(fs.readFileSync(filePath, "utf8"));
  return JSON.parse(raw);
}

export function readJsonArray(filePath) {
  const raw = stripBom(fs.readFileSync(filePath, "utf8"));
  const parsed = JSON.parse(raw);
  return Array.isArray(parsed) ? parsed : [];
}

export function writeJsonFile(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

function stripBom(text) {
  return String(text).replace(/^\uFEFF/, "");
}
