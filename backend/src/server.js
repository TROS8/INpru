import express from "express";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import { appConfig } from "./config.js";
import { writeJsonFile } from "./shared/json-files.js";
import { createQuote, getQuoteByNumber, listQuotes } from "./modules/quotes/services/quote-service.js";
import { getCustomerByNit, listCustomers } from "./modules/quotes/services/customer-service.js";
import { createProduct, deleteProduct, listProducts, productHistory, updateProduct } from "./modules/products/services/products-service.js";
import { addProductColumn, listProductColumns, removeProductColumn } from "./modules/products/columns/product-columns-service.js";
import { addServiceColumn, listServiceColumns, removeServiceColumn } from "./modules/services/columns/service-columns-service.js";
import { createService, deleteService, listServices, serviceHistory, updateService } from "./modules/services/services/services-service.js";
import {
  createProductType,
  deleteProductType,
  listProductTypes,
  productTypeHistory,
  updateProductType
} from "./modules/product-types/services/product-types-service.js";
import { exportQuoteToPdf } from "./modules/documents/services/quote-export-service.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendPath = path.resolve(__dirname, "..", "..", "frontend");

const app = express();
app.use(express.json({ limit: "2mb" }));
app.use(express.static(frontendPath));

function ensureJsonArrayFile(filePath) {
  const dir = path.dirname(filePath);
  if (!appConfig.fs.existsSync(dir)) appConfig.fs.mkdirSync(dir, { recursive: true });
  if (!appConfig.fs.existsSync(filePath)) writeJsonFile(filePath, []);
}

function ensureJsonObjectFile(filePath, defaultData) {
  const dir = path.dirname(filePath);
  if (!appConfig.fs.existsSync(dir)) appConfig.fs.mkdirSync(dir, { recursive: true });
  if (!appConfig.fs.existsSync(filePath)) writeJsonFile(filePath, defaultData);
}

function readJsonArraySafe(filePath) {
  ensureJsonArrayFile(filePath);
  try {
    const parsed = JSON.parse(appConfig.fs.readFileSync(filePath, "utf8") || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function readJsonObjectSafe(filePath, defaultData) {
  ensureJsonObjectFile(filePath, defaultData);
  try {
    const parsed = JSON.parse(appConfig.fs.readFileSync(filePath, "utf8") || "{}");
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : defaultData;
  } catch {
    return defaultData;
  }
}

function getIvaSetting() {
  const config = readJsonObjectSafe(appConfig.files.ivaSettings, { value: 19, updated_at: new Date().toISOString() });
  const value = Number(config.value);
  if (!Number.isFinite(value) || value < 0 || value > 100) {
    return { value: 19, updated_at: config.updated_at || new Date().toISOString() };
  }
  return { value, updated_at: config.updated_at || null };
}

function sanitizeFileName(fileName) {
  return String(fileName || "archivo")
    .replace(/[\\/:*?"<>|]+/g, "_")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 180) || "archivo";
}

app.get("/", (_req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "cotizaciones-backend", timestamp: new Date().toISOString() });
});

app.get("/api/catalog/products", (_req, res) => {
  const filePath = appConfig.files.productsCurrent;
  const exists = appConfig.fs.existsSync(filePath);
  const items = exists ? JSON.parse(appConfig.fs.readFileSync(filePath, "utf8")) : [];
  const activeItems = items.filter((item) => item.active);
  res.json({ ok: true, total: activeItems.length, products: activeItems });
});

app.get("/api/products", (req, res) => {
  const includeInactive = String(req.query.includeInactive || "").toLowerCase() === "true";
  const result = listProducts({ cfg: appConfig, includeInactive });
  res.json(result);
});

app.post("/api/products", (req, res) => {
  const result = createProduct({ payload: req.body || {}, cfg: appConfig });
  res.status(result.ok ? 201 : 400).json(result);
});

app.put("/api/products/:code", (req, res) => {
  const result = updateProduct({ code: req.params.code, payload: req.body || {}, cfg: appConfig });
  res.status(result.ok ? 200 : 400).json(result);
});

app.delete("/api/products/:code", (req, res) => {
  const changedBy = String(req.query.changedBy || "app-user");
  const result = deleteProduct({ code: req.params.code, changedBy, cfg: appConfig });
  res.status(result.ok ? 200 : 400).json(result);
});

app.get("/api/products/history", (req, res) => {
  const code = String(req.query.code || "").trim();
  const result = productHistory({ code, cfg: appConfig });
  res.json(result);
});

app.get("/api/products/columns", (_req, res) => {
  const result = listProductColumns({ cfg: appConfig });
  res.json(result);
});

app.post("/api/products/columns", (req, res) => {
  const result = addProductColumn({ payload: req.body || {}, cfg: appConfig });
  res.status(result.ok ? 201 : 400).json(result);
});

app.delete("/api/products/columns/:key", (req, res) => {
  const result = removeProductColumn({ key: req.params.key, cfg: appConfig });
  res.status(result.ok ? 200 : 400).json(result);
});

app.get("/api/services", (req, res) => {
  const includeInactive = String(req.query.includeInactive || "").toLowerCase() === "true";
  const result = listServices({ cfg: appConfig, includeInactive });
  res.json(result);
});

app.post("/api/services", (req, res) => {
  const result = createService({ payload: req.body || {}, cfg: appConfig });
  res.status(result.ok ? 201 : 400).json(result);
});

app.put("/api/services/:code", (req, res) => {
  const result = updateService({ code: req.params.code, payload: req.body || {}, cfg: appConfig });
  res.status(result.ok ? 200 : 400).json(result);
});

app.delete("/api/services/:code", (req, res) => {
  const changedBy = String(req.query.changedBy || "app-user");
  const result = deleteService({ code: req.params.code, changedBy, cfg: appConfig });
  res.status(result.ok ? 200 : 400).json(result);
});

app.get("/api/services/history", (req, res) => {
  const code = String(req.query.code || "").trim();
  const result = serviceHistory({ code, cfg: appConfig });
  res.json(result);
});

app.get("/api/services/columns", (_req, res) => {
  const result = listServiceColumns({ cfg: appConfig });
  res.json(result);
});

app.post("/api/services/columns", (req, res) => {
  const result = addServiceColumn({ payload: req.body || {}, cfg: appConfig });
  res.status(result.ok ? 201 : 400).json(result);
});

app.delete("/api/services/columns/:key", (req, res) => {
  const result = removeServiceColumn({ key: req.params.key, cfg: appConfig });
  res.status(result.ok ? 200 : 400).json(result);
});

app.get("/api/product-types", (req, res) => {
  const includeInactive = String(req.query.includeInactive || "").toLowerCase() === "true";
  const result = listProductTypes({ cfg: appConfig, includeInactive });
  res.json(result);
});

app.post("/api/product-types", (req, res) => {
  const result = createProductType({ payload: req.body || {}, cfg: appConfig });
  res.status(result.ok ? 201 : 400).json(result);
});

app.put("/api/product-types/:code", (req, res) => {
  const result = updateProductType({ code: req.params.code, payload: req.body || {}, cfg: appConfig });
  res.status(result.ok ? 200 : 400).json(result);
});

app.delete("/api/product-types/:code", (req, res) => {
  const changedBy = String(req.query.changedBy || "app-user");
  const result = deleteProductType({ code: req.params.code, changedBy, cfg: appConfig });
  res.status(result.ok ? 200 : 400).json(result);
});

app.get("/api/product-types/history", (req, res) => {
  const code = String(req.query.code || "").trim();
  const result = productTypeHistory({ code, cfg: appConfig });
  res.json(result);
});

app.get("/api/customers", (req, res) => {
  const query = String(req.query.query || "");
  const result = listCustomers({ query, cfg: appConfig });
  const companies = readJsonArraySafe(appConfig.files.companies);
  const mappedCompanies = companies.map((c) => ({
    nit: c.nit || "",
    company_name: c.name || "",
    contact: c.contact || "",
    project: c.project || "",
    location: c.address || "",
    phone: c.phone || "",
    email: c.email || "",
    information: c.information || ""
  }));
  const mergedByNit = new Map();
  [...mappedCompanies, ...(result.customers || [])].forEach((x) => {
    const key = String(x.nit || "").trim();
    if (key) mergedByNit.set(key, x);
  });
  const q = query.trim().toLowerCase();
  const customers = [...mergedByNit.values()].filter((c) => {
    if (!q) return true;
    return String(c.nit || "").toLowerCase().includes(q) || String(c.company_name || "").toLowerCase().includes(q);
  });
  res.json({ ok: true, total: customers.length, customers: customers.slice(0, 100) });
});

app.get("/api/customers/:nit", (req, res) => {
  const { nit } = req.params;
  const companies = readJsonArraySafe(appConfig.files.companies);
  const company = companies.find((x) => String(x.nit || "").trim() === String(nit || "").trim());
  if (company) {
    return res.json({
      ok: true,
      customer: {
        nit: company.nit || "",
        company_name: company.name || "",
        contact: company.contact || "",
        project: company.project || "",
        location: company.address || "",
        phone: company.phone || "",
        email: company.email || "",
        information: company.information || "",
        company_id: company.id,
        company_file_url: company.file?.path ? `/api/companies/${encodeURIComponent(company.id)}/file` : null
      }
    });
  }
  const result = getCustomerByNit({ nit, cfg: appConfig });
  const status = result.ok ? 200 : 404;
  res.status(status).json(result);
});

app.get("/api/settings/iva", (_req, res) => {
  const setting = getIvaSetting();
  res.json({ ok: true, iva: setting.value, updated_at: setting.updated_at });
});

app.put("/api/settings/iva", (req, res) => {
  const value = Number(req.body?.value);
  if (!Number.isFinite(value) || value < 0 || value > 100) {
    return res.status(400).json({ ok: false, error: "IVA invalido. Debe estar entre 0 y 100" });
  }
  const next = { value, updated_at: new Date().toISOString() };
  ensureJsonObjectFile(appConfig.files.ivaSettings, next);
  writeJsonFile(appConfig.files.ivaSettings, next);
  return res.json({ ok: true, iva: value, updated_at: next.updated_at });
});

app.get("/api/companies", (_req, res) => {
  const companies = readJsonArraySafe(appConfig.files.companies);
  res.json({ ok: true, total: companies.length, companies });
});

app.post("/api/companies", (req, res) => {
  const nit = String(req.body?.nit || "").trim();
  const name = String(req.body?.name || "").trim();
  const email = String(req.body?.email || "").trim();
  const phone = String(req.body?.phone || "").trim();
  const address = String(req.body?.address || "").trim();
  const contact = String(req.body?.contact || "").trim();
  const project = String(req.body?.project || "").trim();
  const information = String(req.body?.information || "").trim();

  if (!nit) return res.status(400).json({ ok: false, error: "NIT es obligatorio" });
  if (!name) return res.status(400).json({ ok: false, error: "Empresa es obligatoria" });
  if (!email) return res.status(400).json({ ok: false, error: "Correo es obligatorio" });
  if (!phone) return res.status(400).json({ ok: false, error: "Telefono es obligatorio" });

  const companies = readJsonArraySafe(appConfig.files.companies);
  if (companies.some((x) => String(x.nit || "").trim() === nit)) {
    return res.status(400).json({ ok: false, error: "Ya existe una empresa con ese NIT" });
  }
  const id = crypto.randomUUID();
  const company = {
    id,
    name,
    email,
    phone,
    nit,
    address,
    contact,
    project,
    information,
    file: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  companies.push(company);
  writeJsonFile(appConfig.files.companies, companies);

  const customers = readJsonArraySafe(appConfig.files.customers);
  const customerRecord = {
    nit,
    company_name: name,
    contact,
    project,
    location: address,
    phone,
    email,
    information,
    updated_at: new Date().toISOString(),
    created_at: new Date().toISOString()
  };
  const idx = customers.findIndex((c) => String(c.nit || "").trim() === nit);
  if (idx >= 0) customers[idx] = { ...customers[idx], ...customerRecord };
  else customers.push(customerRecord);
  writeJsonFile(appConfig.files.customers, customers);

  return res.status(201).json({ ok: true, company });
});

app.put("/api/companies/:id", (req, res) => {
  const id = String(req.params.id || "").trim();
  const companies = readJsonArraySafe(appConfig.files.companies);
  const idx = companies.findIndex((x) => x.id === id);
  if (idx < 0) return res.status(404).json({ ok: false, error: "Empresa no encontrada" });

  const nit = String(req.body?.nit || "").trim();
  const name = String(req.body?.name || "").trim();
  const email = String(req.body?.email || "").trim();
  const phone = String(req.body?.phone || "").trim();
  const address = String(req.body?.address || "").trim();
  const contact = String(req.body?.contact || "").trim();
  const project = String(req.body?.project || "").trim();
  const information = String(req.body?.information || "").trim();

  if (!nit) return res.status(400).json({ ok: false, error: "NIT es obligatorio" });
  if (!name) return res.status(400).json({ ok: false, error: "Empresa es obligatoria" });
  if (!email) return res.status(400).json({ ok: false, error: "Correo es obligatorio" });
  if (!phone) return res.status(400).json({ ok: false, error: "Telefono es obligatorio" });
  if (companies.some((x, i) => i !== idx && String(x.nit || "").trim() === nit)) {
    return res.status(400).json({ ok: false, error: "Ya existe otra empresa con ese NIT" });
  }

  companies[idx] = {
    ...companies[idx],
    nit,
    name,
    email,
    phone,
    address,
    contact,
    project,
    information,
    updated_at: new Date().toISOString()
  };
  writeJsonFile(appConfig.files.companies, companies);

  const customers = readJsonArraySafe(appConfig.files.customers);
  const customerRecord = {
    nit,
    company_name: name,
    contact,
    project,
    location: address,
    phone,
    email,
    information,
    updated_at: new Date().toISOString()
  };
  const cidx = customers.findIndex((c) => String(c.nit || "").trim() === nit);
  if (cidx >= 0) customers[cidx] = { ...customers[cidx], ...customerRecord };
  else customers.push({ ...customerRecord, created_at: new Date().toISOString() });
  writeJsonFile(appConfig.files.customers, customers);

  return res.json({ ok: true, company: companies[idx] });
});

app.put("/api/companies/:id/file", express.raw({ type: "*/*", limit: "30mb" }), (req, res) => {
  const id = String(req.params.id || "").trim();
  const companies = readJsonArraySafe(appConfig.files.companies);
  const index = companies.findIndex((x) => x.id === id);
  if (index < 0) return res.status(404).json({ ok: false, error: "Empresa no encontrada" });

  const bytes = req.body;
  if (!bytes || !Buffer.isBuffer(bytes) || bytes.length === 0) {
    return res.status(400).json({ ok: false, error: "Archivo invalido" });
  }

  const sourceName = sanitizeFileName(req.headers["x-filename"] || "archivo.bin");
  const companyDir = path.join(appConfig.files.companyFilesRoot, id);
  if (!appConfig.fs.existsSync(companyDir)) appConfig.fs.mkdirSync(companyDir, { recursive: true });

  const finalName = `${Date.now()}_${sourceName}`;
  const fullPath = path.join(companyDir, finalName);
  appConfig.fs.writeFileSync(fullPath, bytes);

  companies[index].file = {
    name: sourceName,
    stored_name: finalName,
    path: fullPath,
    size: bytes.length,
    uploaded_at: new Date().toISOString()
  };
  companies[index].updated_at = new Date().toISOString();
  writeJsonFile(appConfig.files.companies, companies);

  return res.json({ ok: true, company: companies[index] });
});

app.get("/api/companies/:id/file", (req, res) => {
  const id = String(req.params.id || "").trim();
  const companies = readJsonArraySafe(appConfig.files.companies);
  const company = companies.find((x) => x.id === id);
  if (!company || !company.file?.path) return res.status(404).json({ ok: false, error: "Archivo no encontrado" });
  if (!appConfig.fs.existsSync(company.file.path)) return res.status(404).json({ ok: false, error: "Archivo no disponible" });
  return res.download(company.file.path, company.file.name || "archivo");
});

app.post("/api/quotes", (req, res) => {
  const payload = req.body || {};
  if (payload.taxRate === undefined || payload.taxRate === null || payload.taxRate === "") {
    payload.taxRate = getIvaSetting().value;
  }
  const result = createQuote({ payload, cfg: appConfig });
  const status = result.ok ? 201 : 400;
  res.status(status).json(result);
});

app.get("/api/quotes", (req, res) => {
  const query = String(req.query.query || "");
  const date = String(req.query.date || "");
  const result = listQuotes({ cfg: appConfig, filters: { query, date } });
  res.json(result);
});

app.get("/api/quotes/:quoteNumber", (req, res) => {
  const { quoteNumber } = req.params;
  const result = getQuoteByNumber({ quoteNumber, cfg: appConfig });
  const status = result.ok ? 200 : 404;
  res.status(status).json(result);
});

function clearHistoryHandler(req, res) {
  try {
    const scope = String(req.query.scope || "all").trim().toLowerCase();
    const validScopes = new Set(["all", "products", "services", "quotes"]);
    if (!validScopes.has(scope)) {
      return res.status(400).json({ ok: false, error: "scope invalido. Usa: all, products, services, quotes" });
    }

    const cleared = {
      products_logs: 0,
      services_logs: 0,
      quotes_files: 0
    };

    const clearProducts = scope === "all" || scope === "products";
    const clearServices = scope === "all" || scope === "services";
    const clearQuotes = scope === "all" || scope === "quotes";

    if (clearProducts) {
      const logsPath = appConfig.files.productChangeLogs;
      const logs = appConfig.fs.existsSync(logsPath) ? JSON.parse(appConfig.fs.readFileSync(logsPath, "utf8") || "[]") : [];
      cleared.products_logs = Array.isArray(logs) ? logs.length : 0;
      appConfig.fs.writeFileSync(logsPath, "[]");
    }

    if (clearServices) {
      const logsPath = appConfig.files.serviceChangeLogs;
      const logs = appConfig.fs.existsSync(logsPath) ? JSON.parse(appConfig.fs.readFileSync(logsPath, "utf8") || "[]") : [];
      cleared.services_logs = Array.isArray(logs) ? logs.length : 0;
      appConfig.fs.writeFileSync(logsPath, "[]");
    }

    if (clearQuotes) {
      const quotesRoot = appConfig.files.quotesRoot;
      if (appConfig.fs.existsSync(quotesRoot)) {
        const folders = appConfig.fs.readdirSync(quotesRoot, { withFileTypes: true }).filter((d) => d.isDirectory());
        for (const folder of folders) {
          const dir = path.join(quotesRoot, folder.name);
          const files = appConfig.fs.readdirSync(dir).filter((f) => f.toLowerCase().endsWith(".json"));
          for (const file of files) {
            appConfig.fs.unlinkSync(path.join(dir, file));
            cleared.quotes_files += 1;
          }
          const leftovers = appConfig.fs.readdirSync(dir);
          if (leftovers.length === 0) {
            appConfig.fs.rmdirSync(dir);
          }
        }
      }
    }

    return res.json({
      ok: true,
      scope,
      message: "Historial eliminado correctamente",
      cleared
    });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error?.message || "Error eliminando historial" });
  }
}

app.delete("/api/history", clearHistoryHandler);
app.post("/api/history/clear", clearHistoryHandler);

app.post("/api/quotes/:quoteNumber/export-pdf", async (req, res) => {
  try {
    const { quoteNumber } = req.params;
    const result = await exportQuoteToPdf({ quoteNumber, cfg: appConfig });
    res.status(result.ok ? 200 : 400).json(result);
  } catch (error) {
    res.status(500).json({ ok: false, error: error?.message || "Error exportando PDF" });
  }
});

app.get("/api/template/docx", (_req, res) => {
  const templatePath = appConfig.files.quoteTemplateDocx;
  if (!appConfig.fs.existsSync(templatePath)) {
    return res.status(404).json({ ok: false, error: "Plantilla DOCX no encontrada" });
  }
  return res.download(templatePath, path.basename(templatePath));
});

app.put("/api/template/docx", express.raw({ type: "*/*", limit: "20mb" }), (req, res) => {
  try {
    const fileName = String(req.headers["x-filename"] || "plantilla.docx");
    if (!fileName.toLowerCase().endsWith(".docx")) {
      return res.status(400).json({ ok: false, error: "Solo se permite archivo .docx" });
    }
    const fileBytes = req.body;
    if (!fileBytes || !Buffer.isBuffer(fileBytes) || fileBytes.length < 4) {
      return res.status(400).json({ ok: false, error: "Archivo inválido" });
    }
    if (!(fileBytes[0] === 0x50 && fileBytes[1] === 0x4b)) {
      return res.status(400).json({ ok: false, error: "El archivo no parece un DOCX válido" });
    }

    const templatePath = appConfig.files.quoteTemplateDocx;
    const backupPath = `${templatePath}.${new Date().toISOString().replace(/[:.]/g, "-")}.bak`;
    if (appConfig.fs.existsSync(templatePath)) {
      appConfig.fs.copyFileSync(templatePath, backupPath);
    }
    appConfig.fs.writeFileSync(templatePath, fileBytes);
    return res.json({
      ok: true,
      message: "Plantilla actualizada correctamente",
      template_path: templatePath,
      backup_path: appConfig.fs.existsSync(backupPath) ? backupPath : null
    });
  } catch (error) {
    if (error?.code === "EBUSY" || error?.code === "EPERM") {
      return res.status(423).json({
        ok: false,
        error: "La plantilla está abierta en otra aplicación. Cierra Word/visor y vuelve a intentar."
      });
    }
    return res.status(500).json({ ok: false, error: error?.message || "Error actualizando plantilla" });
  }
});

app.get("/api/quotes/:quoteNumber/download/:kind", (req, res) => {
  const { quoteNumber, kind } = req.params;
  const found = getQuoteByNumber({ quoteNumber, cfg: appConfig });
  if (!found.ok) return res.status(404).json({ ok: false, error: "Cotizacion no encontrada" });

  const quoteDir = path.dirname(found.quote_path);
  const ext = kind === "pdf" ? "pdf" : kind === "docx" ? "docx" : "";
  if (!ext) return res.status(400).json({ ok: false, error: "Tipo de descarga invalido" });

  const filePath = path.join(quoteDir, `${quoteNumber}.${ext}`);
  if (!appConfig.fs.existsSync(filePath)) {
    return res.status(404).json({ ok: false, error: `Archivo ${ext.toUpperCase()} no generado` });
  }

  return res.download(filePath, `${quoteNumber}.${ext}`);
});

app.use((err, _req, res, _next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    ok: false,
    error: err?.message || "Error interno del servidor"
  });
});

app.listen(appConfig.port, () => {
  console.log(`Backend running on http://localhost:${appConfig.port}`);
});

