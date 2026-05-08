import { readJsonArray, writeJsonFile } from "../../../shared/json-files.js";

const KEY_PATTERN = /^[a-z][a-z0-9_]{1,30}$/;

export function listProductColumns({ cfg }) {
  const columns = readJsonArray(cfg.files.productColumns);
  return { ok: true, columns };
}

export function addProductColumn({ payload, cfg }) {
  const columns = readJsonArray(cfg.files.productColumns);
  const key = String(payload.key || "").trim().toLowerCase();
  const label = String(payload.label || "").trim();
  const required = Boolean(payload.required);

  if (!KEY_PATTERN.test(key)) {
    return { ok: false, error: "key invalido. Usa minusculas, numeros y guion bajo." };
  }
  if (!label) {
    return { ok: false, error: "label es obligatorio" };
  }
  if (columns.some((c) => c.key === key)) {
    return { ok: false, error: "La columna ya existe" };
  }

  const next = { key, label, required, fixed: false };
  columns.push(next);
  writeJsonFile(cfg.files.productColumns, columns);
  return { ok: true, column: next, columns };
}

export function removeProductColumn({ key, cfg }) {
  const columns = readJsonArray(cfg.files.productColumns);
  const idx = columns.findIndex((c) => c.key === key);
  if (idx < 0) return { ok: false, error: "Columna no encontrada" };
  if (columns[idx].fixed) return { ok: false, error: "No se puede eliminar una columna fija" };

  const removed = columns[idx];
  columns.splice(idx, 1);
  writeJsonFile(cfg.files.productColumns, columns);
  return { ok: true, removed, columns };
}
