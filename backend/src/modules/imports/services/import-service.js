import { randomUUID } from "node:crypto";
import { parseCsv } from "../../../shared/csv.js";
import { appendImportLog } from "../../../shared/logs.js";
import { validateProducts } from "../validators/products-validator.js";
import { validatePaymentMethods } from "../validators/payment-validator.js";

export function importProductsCsv({ csvContent, uploadedBy, fileName, cfg }) {
  const { headers, rows } = parseCsv(csvContent || "");
  const result = validateProducts(headers, rows);

  const logRecord = {
    id: randomUUID(),
    importedAt: new Date().toISOString(),
    type: "products",
    fileName: fileName || "products.csv",
    uploadedBy: uploadedBy || "anonymous",
    success: result.isValid,
    totalRows: rows.length,
    errorCount: result.errors.length
  };

  if (result.isValid) {
    cfg.fs.writeFileSync(cfg.files.productsCurrent, JSON.stringify(result.data, null, 2));
  }

  appendImportLog({ importLogsPath: cfg.files.importLogs, record: logRecord, fs: cfg.fs });

  return {
    ok: result.isValid,
    importedRows: result.data.length,
    errors: result.errors,
    log: logRecord
  };
}

export function importPaymentMethodsCsv({ csvContent, uploadedBy, fileName, cfg }) {
  const { headers, rows } = parseCsv(csvContent || "");
  const result = validatePaymentMethods(headers, rows);

  const logRecord = {
    id: randomUUID(),
    importedAt: new Date().toISOString(),
    type: "payment_methods",
    fileName: fileName || "payment_methods.csv",
    uploadedBy: uploadedBy || "anonymous",
    success: result.isValid,
    totalRows: rows.length,
    errorCount: result.errors.length
  };

  if (result.isValid) {
    cfg.fs.writeFileSync(cfg.files.paymentMethodsCurrent, JSON.stringify(result.data, null, 2));
  }

  appendImportLog({ importLogsPath: cfg.files.importLogs, record: logRecord, fs: cfg.fs });

  return {
    ok: result.isValid,
    importedRows: result.data.length,
    errors: result.errors,
    log: logRecord
  };
}
