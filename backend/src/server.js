import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { appConfig } from "./config.js";
import { createQuote, getQuoteByNumber, listQuotes } from "./modules/quotes/services/quote-service.js";
import { getCustomerByNit } from "./modules/quotes/services/customer-service.js";
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

app.get("/api/customers/:nit", (req, res) => {
  const { nit } = req.params;
  const result = getCustomerByNit({ nit, cfg: appConfig });
  const status = result.ok ? 200 : 404;
  res.status(status).json(result);
});

app.post("/api/quotes", (req, res) => {
  const result = createQuote({ payload: req.body || {}, cfg: appConfig });
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
    // DOCX debe ser ZIP: cabecera PK
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
