import crypto from "node:crypto";
import { readJsonArray, writeJsonFile } from "../../../shared/json-files.js";

export function listProductTypes({ cfg, includeInactive = false }) {
  const items = readJsonArray(cfg.files.productTypesCurrent);
  const productTypes = includeInactive ? items : items.filter((x) => x.active);
  return { ok: true, total: productTypes.length, productTypes };
}

export function createProductType({ payload, cfg }) {
  const items = readJsonArray(cfg.files.productTypesCurrent);
  const code = String(payload.type_code || "").trim();
  if (!code) return { ok: false, error: "type_code es obligatorio" };
  if (items.some((x) => x.type_code === code)) return { ok: false, error: "type_code ya existe" };

  const valid = validateProductTypePayload(payload);
  if (!valid.ok) return valid;

  const next = normalizeProductType(payload);
  items.push(next);
  writeJsonFile(cfg.files.productTypesCurrent, items);
  appendLog({ action: "create", code, before: null, after: next, changedBy: payload.changedBy, cfg });
  return { ok: true, productType: next };
}

export function updateProductType({ code, payload, cfg }) {
  const items = readJsonArray(cfg.files.productTypesCurrent);
  const idx = items.findIndex((x) => x.type_code === code);
  if (idx < 0) return { ok: false, error: "Tipo de producto no encontrado" };

  const before = { ...items[idx] };
  const mergedPayload = { ...items[idx], ...payload, type_code: code };
  const valid = validateProductTypePayload(mergedPayload);
  if (!valid.ok) return valid;

  const merged = normalizeProductType(mergedPayload);
  items[idx] = merged;
  writeJsonFile(cfg.files.productTypesCurrent, items);
  appendLog({ action: "update", code, before, after: merged, changedBy: payload.changedBy, cfg });
  return { ok: true, productType: merged };
}

export function deleteProductType({ code, changedBy, cfg }) {
  const items = readJsonArray(cfg.files.productTypesCurrent);
  const idx = items.findIndex((x) => x.type_code === code);
  if (idx < 0) return { ok: false, error: "Tipo de producto no encontrado" };

  const before = { ...items[idx] };
  items.splice(idx, 1);
  writeJsonFile(cfg.files.productTypesCurrent, items);
  appendLog({ action: "delete", code, before, after: null, changedBy, cfg });
  return { ok: true, deleted: true, type_code: code };
}

export function productTypeHistory({ code, cfg }) {
  const logs = readJsonArray(cfg.files.productTypeChangeLogs);
  const filtered = code ? logs.filter((x) => x.type_code === code) : logs;
  return { ok: true, total: filtered.length, logs: filtered.slice(-200).reverse() };
}

function normalizeProductType(payload) {
  return {
    type_code: String(payload.type_code || "").trim(),
    comment: String(payload.comment || "").trim(),
    active: Boolean(payload.active),
    updated_at: new Date().toISOString().slice(0, 10)
  };
}

function validateProductTypePayload(payload) {
  if (!String(payload.comment || "").trim()) return { ok: false, error: "Comentario es obligatorio" };
  return { ok: true };
}

function appendLog({ action, code, before, after, changedBy, cfg }) {
  const logs = readJsonArray(cfg.files.productTypeChangeLogs);
  logs.push({
    id: crypto.randomUUID(),
    at: new Date().toISOString(),
    action,
    type_code: code,
    changed_by: String(changedBy || "app-user"),
    before,
    after
  });
  writeJsonFile(cfg.files.productTypeChangeLogs, logs);
}
