const REQUIRED_HEADERS = [
  "payment_code",
  "payment_name",
  "account_number",
  "account_type",
  "bank_name",
  "owner_name",
  "owner_id",
  "instructions",
  "active",
  "updated_at"
];

export function validatePaymentMethods(headers, rows) {
  const errors = [];
  const missing = REQUIRED_HEADERS.filter((h) => !headers.includes(h));
  if (missing.length > 0) {
    errors.push({ row: 1, message: `Faltan columnas requeridas: ${missing.join(", ")}` });
  }

  const seenCodes = new Set();
  const normalized = [];

  for (const { rowNumber, data } of rows) {
    const paymentCode = String(data.payment_code || "").trim();
    const paymentName = String(data.payment_name || "").trim();
    const accountNumber = String(data.account_number || "").trim();
    const accountType = String(data.account_type || "").trim();
    const bankName = String(data.bank_name || "").trim();
    const ownerName = String(data.owner_name || "").trim();
    const ownerId = String(data.owner_id || "").trim();
    const instructions = String(data.instructions || "").trim();
    const activeRaw = String(data.active || "").trim().toLowerCase();
    const updatedAt = String(data.updated_at || "").trim();

    if (!paymentCode) errors.push({ row: rowNumber, message: "payment_code es obligatorio" });
    if (!paymentName) errors.push({ row: rowNumber, message: "payment_name es obligatorio" });
    if (!updatedAt) errors.push({ row: rowNumber, message: "updated_at es obligatorio" });

    if (!["true", "false"].includes(activeRaw)) {
      errors.push({ row: rowNumber, message: "active debe ser true o false" });
    }

    if (paymentCode) {
      if (seenCodes.has(paymentCode)) {
        errors.push({ row: rowNumber, message: `payment_code duplicado: ${paymentCode}` });
      }
      seenCodes.add(paymentCode);
    }

    if (paymentCode.startsWith("TRF") && !accountNumber) {
      errors.push({ row: rowNumber, message: "account_number es obligatorio para transferencias" });
    }

    normalized.push({
      payment_code: paymentCode,
      payment_name: paymentName,
      account_number: accountNumber,
      account_type: accountType,
      bank_name: bankName,
      owner_name: ownerName,
      owner_id: ownerId,
      instructions,
      active: activeRaw === "true",
      updated_at: updatedAt
    });
  }

  const activeCount = normalized.filter((x) => x.active).length;
  if (activeCount === 0) {
    errors.push({ row: 0, message: "Debe existir al menos un metodo de pago activo" });
  }

  return {
    isValid: errors.length === 0,
    errors,
    data: normalized
  };
}
