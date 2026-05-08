import crypto from "node:crypto";
import { readJsonArray, writeJsonFile } from "../../../shared/json-files.js";

export function listProducts({ cfg, includeInactive = false }) {
  const items = readJsonArray(cfg.files.productsCurrent);
  const products = includeInactive ? items : items.filter((x) => x.active);
  return { ok: true, total: products.length, products };
}

export function createProduct({ payload, cfg }) {
  const items = readJsonArray(cfg.files.productsCurrent);
  const columns = readJsonArray(cfg.files.productColumns);
  const code = String(payload.product_code || "").trim();
  if (!code) return { ok: false, error: "product_code es obligatorio" };
  if (items.some((x) => x.product_code === code)) return { ok: false, error: "product_code ya existe" };

  const valid = validateProductPayload(payload, columns);
  if (!valid.ok) return valid;

  const next = normalizeProduct(payload, columns);
  items.push(next);
  writeJsonFile(cfg.files.productsCurrent, items);
  appendProductLog({ action: "create", productCode: code, before: null, after: next, changedBy: payload.changedBy, cfg });
  return { ok: true, product: next };
}

export function updateProduct({ code, payload, cfg }) {
  const items = readJsonArray(cfg.files.productsCurrent);
  const columns = readJsonArray(cfg.files.productColumns);
  const idx = items.findIndex((x) => x.product_code === code);
  if (idx < 0) return { ok: false, error: "Producto no encontrado" };

  const before = { ...items[idx] };
  const mergedPayload = { ...items[idx], ...payload, product_code: code };
  const valid = validateProductPayload(mergedPayload, columns);
  if (!valid.ok) return valid;

  const merged = normalizeProduct(mergedPayload, columns);
  items[idx] = merged;
  writeJsonFile(cfg.files.productsCurrent, items);
  appendProductLog({ action: "update", productCode: code, before, after: merged, changedBy: payload.changedBy, cfg });
  return { ok: true, product: merged };
}

export function deleteProduct({ code, changedBy, cfg }) {
  const items = readJsonArray(cfg.files.productsCurrent);
  const idx = items.findIndex((x) => x.product_code === code);
  if (idx < 0) return { ok: false, error: "Producto no encontrado" };

  const before = { ...items[idx] };
  items.splice(idx, 1);
  writeJsonFile(cfg.files.productsCurrent, items);
  appendProductLog({ action: "delete", productCode: code, before, after: null, changedBy, cfg });
  return { ok: true, deleted: true, product_code: code };
}

export function productHistory({ code, cfg }) {
  const logs = readJsonArray(cfg.files.productChangeLogs);
  const filtered = code ? logs.filter((x) => x.product_code === code) : logs;
  return { ok: true, total: filtered.length, logs: filtered.slice(-200).reverse() };
}

function normalizeProduct(payload, columns) {
  const quantity = Number(payload.quantity ?? 1);
  const unitPrice = Number(payload.unit_price || 0);
  const q = Number.isFinite(quantity) && quantity > 0 ? quantity : 1;

  const extras = {};
  const fixedKeys = new Set(["product_code", "product_name", "diameter", "quantity", "unit_price", "total", "currency", "active", "updated_at"]);
  columns.forEach((c) => {
    if (!fixedKeys.has(c.key)) {
      extras[c.key] = payload[c.key] ?? "";
    }
  });

  return {
    product_code: String(payload.product_code || "").trim(),
    product_name: String(payload.product_name || "").trim(),
    diameter: String(payload.diameter || "").trim(),
    quantity: q,
    unit_price: unitPrice,
    total: q * unitPrice,
    currency: String(payload.currency || "COP").trim(),
    active: Boolean(payload.active),
    updated_at: new Date().toISOString().slice(0, 10),
    extras
  };
}

function validateProductPayload(payload, columns) {
  if (!String(payload.product_name || "").trim()) return { ok: false, error: "DESCRIPCION es obligatoria" };
  if (!String(payload.diameter || "").trim()) return { ok: false, error: "DIAMETRO es obligatorio" };
  const q = Number(payload.quantity);
  if (!Number.isFinite(q) || q <= 0) return { ok: false, error: "CANTIDAD debe ser mayor que 0" };
  const u = Number(payload.unit_price);
  if (!Number.isFinite(u) || u <= 0) return { ok: false, error: "P. UNITARIO debe ser mayor que 0" };

  const requiredDynamic = columns.filter((c) => !c.fixed && c.required);
  for (const c of requiredDynamic) {
    const v = payload[c.key];
    if (v === undefined || v === null || String(v).trim() === "") {
      return { ok: false, error: `${c.label} es obligatoria` };
    }
  }
  return { ok: true };
}

function appendProductLog({ action, productCode, before, after, changedBy, cfg }) {
  const logs = readJsonArray(cfg.files.productChangeLogs);
  logs.push({
    id: crypto.randomUUID(),
    at: new Date().toISOString(),
    action,
    product_code: productCode,
    changed_by: String(changedBy || "app-user"),
    before,
    after
  });
  writeJsonFile(cfg.files.productChangeLogs, logs);
}
