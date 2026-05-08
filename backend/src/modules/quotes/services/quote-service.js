import path from "node:path";
import { readJsonArray, readJsonObject, writeJsonFile } from "../../../shared/json-files.js";
import { validateCreateQuotePayload } from "../validators/quote-validator.js";
import { addBusinessDaysFromDate, getTodayDateInBogota, getValidityWindow } from "../utils/dates.js";
import { nextQuoteIdentity } from "../utils/counter.js";
import { upsertCustomerFromQuote } from "./customer-service.js";

export function createQuote({ payload, cfg }) {
  const payloadValidation = validateCreateQuotePayload(payload);
  if (!payloadValidation.isValid) {
    return {
      ok: false,
      errors: payloadValidation.errors
    };
  }

  const products = readJsonArray(cfg.files.productsCurrent);
  const servicesCatalog = readJsonArray(cfg.files.servicesCurrent);
  const productTypesCatalog = readJsonArray(cfg.files.productTypesCurrent);
  const businessRules = readJsonObject(cfg.files.businessRules);

  if (products.length === 0) {
    return { ok: false, errors: ["No hay productos vigentes cargados"] };
  }

  const activeProducts = products.filter((p) => p.active);
  const activeServices = servicesCatalog.filter((s) => s.active);
  const activeProductTypes = productTypesCatalog.filter((t) => t.active);
  const productMap = new Map(activeProducts.map((p) => [p.product_code, p]));
  const serviceMap = new Map(activeServices.map((s) => [s.service_code, s]));
  const productTypeMap = new Map(activeProductTypes.map((t) => [t.type_code, t]));

  const errors = [];
  const quoteItems = [];
  const quoteServices = [];
  const quoteProductTypes = [];

  payload.items.forEach((item, index) => {
    const product = productMap.get(item.product_code);
    const row = index + 1;

    if (!product) {
      errors.push(`items[${row}]: producto no existe o esta inactivo (${item.product_code})`);
      return;
    }

    const quantity = Number(item.quantity);
    const unitPrice = Number(item.unit_price);
    const itemTotal = quantity * unitPrice;

    quoteItems.push({
      line: row,
      product_code: product.product_code,
      description: product.product_name,
      diameter: String(product.diameter || "").trim(),
      quantity,
      unit_price: unitPrice,
      currency: product.currency,
      extras: product.extras || {},
      item_total: itemTotal
    });
  });

  (payload.services || []).forEach((service, index) => {
    const found = serviceMap.get(service.service_code);
    const row = index + 1;
    if (!found) {
      errors.push(`services[${row}]: servicio no existe o esta inactivo (${service.service_code})`);
      return;
    }
    const quantity = Number(service.quantity);
    const unitPrice = Number(service.unit_price);
    const total = quantity * unitPrice;
    quoteServices.push({
      line: row,
      service_code: found.service_code,
      description: found.description,
      unit: found.unit,
      quantity,
      unit_price: unitPrice,
      total,
      extras: found.extras || {}
    });
  });

  (payload.product_types || []).forEach((item, index) => {
    const found = productTypeMap.get(item.type_code);
    const row = index + 1;
    if (!found) {
      errors.push(`product_types[${row}]: tipo no existe o esta inactivo (${item.type_code})`);
      return;
    }
    quoteProductTypes.push({
      line: row,
      type_code: found.type_code,
      comment: found.comment
    });
  });

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  const productsSubtotal = quoteItems.reduce((sum, item) => sum + item.item_total, 0);
  const servicesSubtotal = quoteServices.reduce((sum, s) => sum + s.total, 0);
  const taxRate = Number(payload.taxRate || 0);
  const productsTaxAmount = productsSubtotal * (taxRate / 100);
  const servicesTaxAmount = servicesSubtotal * (taxRate / 100);
  const productsTotal = productsSubtotal + productsTaxAmount;
  const servicesTotal = servicesSubtotal + servicesTaxAmount;
  const grandSubtotal = productsSubtotal + servicesSubtotal;
  const grandTaxAmount = productsTaxAmount + servicesTaxAmount;
  const grandTotal = productsTotal + servicesTotal;

  const emissionDate = getTodayDateInBogota();
  const validityWindow = getValidityWindow(emissionDate);
  const estimatedDeliveryDate = addBusinessDaysFromDate(
    emissionDate,
    Number(businessRules?.quotation?.deliveryBusinessDays || 7)
  );

  const identity = nextQuoteIdentity({
    counterPath: cfg.files.counter,
    quotesRoot: cfg.files.quotesRoot,
    folderDate: emissionDate,
    fs: cfg.fs
  });

  const quote = {
    quote_number: identity.quoteNumber,
    status: "issued",
    emitted_at: `${emissionDate}T00:00:00`,
    timezone: businessRules?.business?.timezone || "America/Bogota",
    validity: {
      policy: businessRules?.quotation?.validityPolicy || "same_day_only",
      message: businessRules?.quotation?.validityMessage || "",
      ...validityWindow
    },
    customer: {
      nit: String(payload.customer.nit || "").trim(),
      company_name: String(payload.customer.company_name || "").trim(),
      contact: String(payload.customer.contact || "").trim(),
      project: String(payload.customer.project || "").trim(),
      location: String(payload.customer.location || "").trim(),
      phone: String(payload.customer.phone || "").trim(),
      email: String(payload.customer.email || "").trim()
    },
    items: quoteItems,
    services: quoteServices,
    product_types: quoteProductTypes,
    totals: {
      currency: businessRules?.business?.currency || "COP",
      products_subtotal: productsSubtotal,
      products_tax_amount: productsTaxAmount,
      products_total: productsTotal,
      services_subtotal: servicesSubtotal,
      services_tax_amount: servicesTaxAmount,
      services_total: servicesTotal,
      grand_subtotal: grandSubtotal,
      grand_tax_amount: grandTaxAmount,
      grand_total: grandTotal,
      // Compatibilidad con versiones previas:
      subtotal: grandSubtotal,
      tax_rate: taxRate,
      tax_amount: grandTaxAmount,
      total: grandTotal
    },
    estimated_delivery_date: estimatedDeliveryDate,
    metadata: {
      created_by: String(payload.createdBy || "anonymous"),
      created_at: new Date().toISOString(),
      products_source_updated_at: getLastUpdatedAt(products)
    }
  };

  upsertCustomerFromQuote({ customerInput: quote.customer, cfg });
  writeJsonFile(identity.quotePath, quote);

  return {
    ok: true,
    quote_number: quote.quote_number,
    quote_path: identity.quotePath,
    quote
  };
}

export function getQuoteByNumber({ quoteNumber, cfg }) {
  if (!quoteNumber) {
    return { ok: false, error: "quoteNumber es obligatorio" };
  }

  const root = cfg.files.quotesRoot;
  if (!cfg.fs.existsSync(root)) {
    return { ok: false, error: "No existe directorio de cotizaciones" };
  }

  const dateFolders = cfg.fs.readdirSync(root, { withFileTypes: true }).filter((d) => d.isDirectory());

  for (const folder of dateFolders) {
    const candidate = path.join(root, folder.name, `${quoteNumber}.json`);
    if (cfg.fs.existsSync(candidate)) {
      const quote = JSON.parse(cfg.fs.readFileSync(candidate, "utf8"));
      return { ok: true, quote_path: candidate, quote };
    }
  }

  return { ok: false, error: "Cotizacion no encontrada" };
}

export function listQuotes({ cfg, filters = {} }) {
  const root = cfg.files.quotesRoot;
  if (!cfg.fs.existsSync(root)) {
    return { ok: true, total: 0, quotes: [] };
  }

  const all = [];
  const dateFolders = cfg.fs.readdirSync(root, { withFileTypes: true }).filter((d) => d.isDirectory());
  for (const folder of dateFolders) {
    const dir = path.join(root, folder.name);
    const files = cfg.fs.readdirSync(dir).filter((f) => f.toLowerCase().endsWith(".json"));
    for (const f of files) {
      const full = path.join(dir, f);
      try {
        const quote = JSON.parse(cfg.fs.readFileSync(full, "utf8"));
        all.push({
          quote_number: quote.quote_number,
          emitted_at: quote.emitted_at,
          customer_nit: quote.customer?.nit || "",
          customer_company_name: quote.customer?.company_name || "",
          total: Number(quote.totals?.grand_total ?? quote.totals?.total ?? 0),
          path: full
        });
      } catch {
        // ignore malformed files
      }
    }
  }

  const query = String(filters.query || "").trim().toLowerCase();
  const date = String(filters.date || "").trim();
  const filtered = all.filter((q) => {
    const queryOk =
      !query ||
      String(q.quote_number).toLowerCase().includes(query) ||
      String(q.customer_nit).toLowerCase().includes(query) ||
      String(q.customer_company_name).toLowerCase().includes(query);
    const dateOk = !date || String(q.emitted_at || "").startsWith(date);
    return queryOk && dateOk;
  });

  filtered.sort((a, b) => String(b.emitted_at).localeCompare(String(a.emitted_at)));
  return { ok: true, total: filtered.length, quotes: filtered.slice(0, 300) };
}

function getLastUpdatedAt(items) {
  const values = items
    .map((item) => String(item.updated_at || "").trim())
    .filter((v) => v.length > 0)
    .sort();

  return values.length > 0 ? values[values.length - 1] : null;
}
