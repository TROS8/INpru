import crypto from "node:crypto";
import { readJsonArray, writeJsonFile } from "../../../shared/json-files.js";

export function listServices({ cfg, includeInactive = false }) {
  const items = readJsonArray(cfg.files.servicesCurrent);
  const services = includeInactive ? items : items.filter((x) => x.active);
  return { ok: true, total: services.length, services };
}

export function createService({ payload, cfg }) {
  const items = readJsonArray(cfg.files.servicesCurrent);
  const columns = readJsonArray(cfg.files.serviceColumns);
  const code = String(payload.service_code || "").trim();
  if (!code) return { ok: false, error: "service_code es obligatorio" };
  if (items.some((x) => x.service_code === code)) return { ok: false, error: "service_code ya existe" };

  const valid = validateServicePayload(payload, columns);
  if (!valid.ok) return valid;

  const next = normalizeService(payload, columns);
  items.push(next);
  writeJsonFile(cfg.files.servicesCurrent, items);
  appendLog({ action: "create", code, before: null, after: next, changedBy: payload.changedBy, cfg });
  return { ok: true, service: next };
}

export function updateService({ code, payload, cfg }) {
  const items = readJsonArray(cfg.files.servicesCurrent);
  const columns = readJsonArray(cfg.files.serviceColumns);
  const idx = items.findIndex((x) => x.service_code === code);
  if (idx < 0) return { ok: false, error: "Servicio no encontrado" };

  const before = { ...items[idx] };
  const mergedPayload = { ...items[idx], ...payload, service_code: code };
  const valid = validateServicePayload(mergedPayload, columns);
  if (!valid.ok) return valid;

  const merged = normalizeService(mergedPayload, columns);
  items[idx] = merged;
  writeJsonFile(cfg.files.servicesCurrent, items);
  appendLog({ action: "update", code, before, after: merged, changedBy: payload.changedBy, cfg });
  return { ok: true, service: merged };
}

export function deleteService({ code, changedBy, cfg }) {
  const items = readJsonArray(cfg.files.servicesCurrent);
  const idx = items.findIndex((x) => x.service_code === code);
  if (idx < 0) return { ok: false, error: "Servicio no encontrado" };

  const before = { ...items[idx] };
  items.splice(idx, 1);
  writeJsonFile(cfg.files.servicesCurrent, items);
  appendLog({ action: "delete", code, before, after: null, changedBy, cfg });
  return { ok: true, deleted: true, service_code: code };
}

export function serviceHistory({ code, cfg }) {
  const logs = readJsonArray(cfg.files.serviceChangeLogs);
  const filtered = code ? logs.filter((x) => x.service_code === code) : logs;
  return { ok: true, total: filtered.length, logs: filtered.slice(-200).reverse() };
}

function normalizeService(payload, columns) {
  const unitPrice = Number(payload.unit_price || 0);
  const quantity = Number(payload.quantity ?? 1);
  const q = Number.isFinite(quantity) && quantity > 0 ? quantity : 1;
  const extras = {};
  const fixedKeys = new Set(["service_code", "description", "unit", "unit_price", "total", "active", "updated_at", "quantity"]);
  columns.forEach((c) => {
    if (!fixedKeys.has(c.key)) extras[c.key] = payload[c.key] ?? "";
  });

  return {
    service_code: String(payload.service_code || "").trim(),
    description: String(payload.description || "").trim(),
    unit: String(payload.unit || "").trim(),
    quantity: q,
    unit_price: unitPrice,
    total: q * unitPrice,
    active: Boolean(payload.active),
    updated_at: new Date().toISOString().slice(0, 10),
    extras
  };
}

function validateServicePayload(payload, columns) {
  if (!String(payload.description || "").trim()) return { ok: false, error: "DESCRIPCIÓN es obligatoria" };
  if (!String(payload.unit || "").trim()) return { ok: false, error: "Und. es obligatoria" };
  const u = Number(payload.unit_price);
  if (!Number.isFinite(u) || u <= 0) return { ok: false, error: "P. UNITARIO debe ser mayor que 0" };

  const requiredDynamic = columns.filter((c) => !c.fixed && c.required);
  for (const c of requiredDynamic) {
    const v = payload[c.key];
    if (v === undefined || v === null || String(v).trim() === "") return { ok: false, error: `${c.label} es obligatoria` };
  }

  return { ok: true };
}

function appendLog({ action, code, before, after, changedBy, cfg }) {
  const logs = readJsonArray(cfg.files.serviceChangeLogs);
  logs.push({
    id: crypto.randomUUID(),
    at: new Date().toISOString(),
    action,
    service_code: code,
    changed_by: String(changedBy || "app-user"),
    before,
    after
  });
  writeJsonFile(cfg.files.serviceChangeLogs, logs);
}
