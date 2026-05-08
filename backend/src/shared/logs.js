export function appendImportLog({ importLogsPath, record, fs }) {
  const current = readJsonArray(importLogsPath, fs);
  current.push(record);
  fs.writeFileSync(importLogsPath, JSON.stringify(current, null, 2));
}

export function readJsonArray(path, fs) {
  try {
    if (!fs.existsSync(path)) {
      return [];
    }

    const raw = String(fs.readFileSync(path, "utf8")).replace(/^\uFEFF/, "");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
