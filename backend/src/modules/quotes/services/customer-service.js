import { readJsonArray, writeJsonFile } from "../../../shared/json-files.js";

export function getCustomerByNit({ nit, cfg }) {
  const cleanNit = String(nit || "").trim();
  if (!cleanNit) {
    return { ok: false, error: "NIT es obligatorio" };
  }

  const customers = readJsonArray(cfg.files.customers);
  const customer = customers.find((c) => c.nit === cleanNit);

  if (!customer) {
    return { ok: false, error: "Cliente no encontrado" };
  }

  return { ok: true, customer };
}

export function upsertCustomerFromQuote({ customerInput, cfg }) {
  const customers = readJsonArray(cfg.files.customers);
  const nit = String(customerInput.nit || "").trim();

  const nextCustomer = {
    nit,
    company_name: String(customerInput.company_name || "").trim(),
    contact: String(customerInput.contact || "").trim(),
    project: String(customerInput.project || "").trim(),
    location: String(customerInput.location || "").trim(),
    phone: String(customerInput.phone || "").trim(),
    email: String(customerInput.email || "").trim(),
    updated_at: new Date().toISOString()
  };

  const index = customers.findIndex((c) => c.nit === nit);
  if (index >= 0) {
    customers[index] = { ...customers[index], ...nextCustomer };
  } else {
    customers.push({ ...nextCustomer, created_at: new Date().toISOString() });
  }

  writeJsonFile(cfg.files.customers, customers);
}
