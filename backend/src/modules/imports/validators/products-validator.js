const REQUIRED_HEADERS = [
  "product_code",
  "product_name",
  "unit_price",
  "currency",
  "active",
  "updated_at"
];

export function validateProducts(headers, rows) {
  const errors = [];
  const missing = REQUIRED_HEADERS.filter((h) => !headers.includes(h));
  if (missing.length > 0) {
    errors.push({ row: 1, message: `Faltan columnas requeridas: ${missing.join(", ")}` });
  }

  const seenCodes = new Set();
  const normalized = [];

  for (const { rowNumber, data } of rows) {
    const code = String(data.product_code || "").trim();
    const name = String(data.product_name || "").trim();
    const currency = String(data.currency || "").trim();
    const activeRaw = String(data.active || "").trim().toLowerCase();
    const updatedAt = String(data.updated_at || "").trim();
    const priceNumber = Number(data.unit_price);

    if (!code) errors.push({ row: rowNumber, message: "product_code es obligatorio" });
    if (!name) errors.push({ row: rowNumber, message: "product_name es obligatorio" });
    if (!currency) errors.push({ row: rowNumber, message: "currency es obligatorio" });
    if (!updatedAt) errors.push({ row: rowNumber, message: "updated_at es obligatorio" });

    if (!Number.isFinite(priceNumber) || priceNumber <= 0) {
      errors.push({ row: rowNumber, message: "unit_price debe ser numerico y mayor que 0" });
    }

    if (!["true", "false"].includes(activeRaw)) {
      errors.push({ row: rowNumber, message: "active debe ser true o false" });
    }

    if (code) {
      if (seenCodes.has(code)) {
        errors.push({ row: rowNumber, message: `product_code duplicado: ${code}` });
      }
      seenCodes.add(code);
    }

    normalized.push({
      product_code: code,
      product_name: name,
      unit_price: priceNumber,
      currency,
      active: activeRaw === "true",
      updated_at: updatedAt
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    data: normalized
  };
}
