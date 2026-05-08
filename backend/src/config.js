import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, "..", "..");

export const appConfig = {
  port: process.env.PORT || 3001,
  files: {
    productsCurrent: path.join(root, "data", "products", "current_products.json"),
    paymentMethodsCurrent: path.join(root, "data", "payments", "current_payment_methods.json"),
    customers: path.join(root, "data", "customers", "customers.json"),
    quotesRoot: path.join(root, "data", "quotes"),
    counter: path.join(root, "data", "system", "counter.json"),
    importLogs: path.join(root, "data", "system", "import_logs.json"),
    productChangeLogs: path.join(root, "data", "system", "product_change_logs.json"),
    productColumns: path.join(root, "data", "system", "product_columns.json"),
    servicesCurrent: path.join(root, "data", "services", "current_services.json"),
    serviceChangeLogs: path.join(root, "data", "system", "service_change_logs.json"),
    serviceColumns: path.join(root, "data", "system", "service_columns.json"),
    productTypesCurrent: path.join(root, "data", "product-types", "current_product_types.json"),
    productTypeChangeLogs: path.join(root, "data", "system", "product_type_change_logs.json"),
    businessRules: path.join(root, "config", "business-rules.json"),
    quoteTemplateDocx: path.join(root, "membrete_smartcouplers_footer_codigo_auto_paginas.docx")
  },
  fs
};
