const API = window.location.protocol === "file:" ? "http://localhost:3001" : "";

const state = {
  products: [],
  items: [],
  columns: [],
  serviceColumns: [],
  services: [],
  quoteServices: [],
  productTypes: [],
  quoteProductTypes: [],
  lastQuoteNumber: "",
  wizardStep: 1
};

const el = {
  adminColumnKey: document.getElementById("adminColumnKey"),
  adminColumnLabel: document.getElementById("adminColumnLabel"),
  adminColumnRequired: document.getElementById("adminColumnRequired"),
  adminColumnDeleteKey: document.getElementById("adminColumnDeleteKey"),
  adminColumnResult: document.getElementById("adminColumnResult"),
  adminColumnsBody: document.getElementById("adminColumnsBody"),
  adminProductsHead: document.getElementById("adminProductsHead"),

  adminProductCode: document.getElementById("adminProductCode"),
  adminProductName: document.getElementById("adminProductName"),
  adminProductDiameter: document.getElementById("adminProductDiameter"),
  adminProductQuantity: document.getElementById("adminProductQuantity"),
  adminProductPrice: document.getElementById("adminProductPrice"),
  adminProductCurrency: document.getElementById("adminProductCurrency"),
  adminProductActive: document.getElementById("adminProductActive"),
  adminChangedBy: document.getElementById("adminChangedBy"),
  adminProductResult: document.getElementById("adminProductResult"),
  adminProductsBody: document.getElementById("adminProductsBody"),
  adminHistoryBody: document.getElementById("adminHistoryBody"),
  historyFilterCode: document.getElementById("historyFilterCode"),
  historyFilterAction: document.getElementById("historyFilterAction"),
  serviceColumnKey: document.getElementById("serviceColumnKey"),
  serviceColumnLabel: document.getElementById("serviceColumnLabel"),
  serviceColumnRequired: document.getElementById("serviceColumnRequired"),
  serviceColumnDeleteKey: document.getElementById("serviceColumnDeleteKey"),
  serviceColumnResult: document.getElementById("serviceColumnResult"),
  serviceColumnsBody: document.getElementById("serviceColumnsBody"),
  serviceCode: document.getElementById("serviceCode"),
  serviceDescription: document.getElementById("serviceDescription"),
  serviceUnit: document.getElementById("serviceUnit"),
  serviceUnitPrice: document.getElementById("serviceUnitPrice"),
  serviceActive: document.getElementById("serviceActive"),
  serviceChangedBy: document.getElementById("serviceChangedBy"),
  serviceResult: document.getElementById("serviceResult"),
  servicesHead: document.getElementById("servicesHead"),
  servicesBody: document.getElementById("servicesBody"),
  serviceHistoryFilterCode: document.getElementById("serviceHistoryFilterCode"),
  serviceHistoryFilterAction: document.getElementById("serviceHistoryFilterAction"),
  serviceHistoryBody: document.getElementById("serviceHistoryBody"),
  productTypeCode: document.getElementById("productTypeCode"),
  productTypeComment: document.getElementById("productTypeComment"),
  productTypeActive: document.getElementById("productTypeActive"),
  productTypeChangedBy: document.getElementById("productTypeChangedBy"),
  productTypeResult: document.getElementById("productTypeResult"),
  productTypesBody: document.getElementById("productTypesBody"),

  productSelect: document.getElementById("productSelect"),
  itemQty: document.getElementById("itemQty"),
  itemUnitPrice: document.getElementById("itemUnitPrice"),
  quoteItemsHead: document.getElementById("quoteItemsHead"),
  itemsTableBody: document.getElementById("itemsTableBody"),
  quoteServiceSelect: document.getElementById("quoteServiceSelect"),
  quoteServiceQty: document.getElementById("quoteServiceQty"),
  quoteServiceUnitPrice: document.getElementById("quoteServiceUnitPrice"),
  quoteServicesHead: document.getElementById("quoteServicesHead"),
  quoteServicesBody: document.getElementById("quoteServicesBody"),
  quoteProductTypeSelect: document.getElementById("quoteProductTypeSelect"),
  quoteProductTypesBody: document.getElementById("quoteProductTypesBody"),

  customerNit: document.getElementById("customerNit"),
  customerCompanyName: document.getElementById("customerCompanyName"),
  customerContact: document.getElementById("customerContact"),
  customerProject: document.getElementById("customerProject"),
  customerLocation: document.getElementById("customerLocation"),
  customerEmail: document.getElementById("customerEmail"),
  customerPhone: document.getElementById("customerPhone"),
  taxRate: document.getElementById("taxRate"),
  quoteResult: document.getElementById("quoteResult"),
  quotePreview: document.getElementById("quotePreview"),
  quoteFilterQuery: document.getElementById("quoteFilterQuery"),
  quoteFilterDate: document.getElementById("quoteFilterDate"),
  quoteHistoryBody: document.getElementById("quoteHistoryBody"),
  historyClearResult: document.getElementById("historyClearResult"),
  docResult: document.getElementById("docResult"),
  templateFileInput: document.getElementById("templateFileInput"),
  toastContainer: document.getElementById("toastContainer"),
  wizardError: document.getElementById("wizardError"),
  wizardStepLabel: document.getElementById("wizardStepLabel"),
  wizardBarFill: document.getElementById("wizardBarFill"),
  wizardPrev: document.getElementById("btnWizardPrev"),
  wizardNext: document.getElementById("btnWizardNext")
};

document.getElementById("btnAddColumn").addEventListener("click", addColumn);
document.getElementById("btnDeleteColumn").addEventListener("click", deleteColumn);
document.getElementById("btnAdminCreateProduct").addEventListener("click", createProductAdmin);
document.getElementById("btnAdminUpdateProduct").addEventListener("click", updateProductAdmin);
document.getElementById("btnAdminDeleteProduct").addEventListener("click", deleteProductAdmin);
document.getElementById("btnAddItem").addEventListener("click", addItem);
document.getElementById("btnCreateQuote").addEventListener("click", createQuote);
document.getElementById("btnAddServiceColumn").addEventListener("click", addServiceColumn);
document.getElementById("btnDeleteServiceColumn").addEventListener("click", deleteServiceColumn);
document.getElementById("btnCreateService").addEventListener("click", createService);
document.getElementById("btnUpdateService").addEventListener("click", updateService);
document.getElementById("btnDeleteService").addEventListener("click", deleteService);
document.getElementById("btnAddQuoteService").addEventListener("click", addQuoteService);
document.getElementById("btnCreateProductType").addEventListener("click", createProductType);
document.getElementById("btnUpdateProductType").addEventListener("click", updateProductType);
document.getElementById("btnDeleteProductType").addEventListener("click", deleteProductType);
document.getElementById("btnAddQuoteProductType").addEventListener("click", addQuoteProductType);
document.getElementById("btnGenerateDocs").addEventListener("click", generateDocuments);
document.getElementById("btnDownloadTemplate").addEventListener("click", downloadTemplate);
document.getElementById("btnUploadTemplate").addEventListener("click", uploadTemplate);
document.getElementById("btnClearAllHistory").addEventListener("click", clearAllHistory);
document.getElementById("btnBackToTop").addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});
el.customerNit.addEventListener("blur", lookupCustomerByNit);
el.productSelect.addEventListener("change", syncSelectedProductPrice);
el.quoteServiceSelect.addEventListener("change", syncSelectedQuoteServicePrice);
el.historyFilterCode.addEventListener("input", refreshHistory);
el.historyFilterAction.addEventListener("change", refreshHistory);
el.quoteFilterQuery.addEventListener("input", refreshQuoteHistory);
el.quoteFilterDate.addEventListener("change", refreshQuoteHistory);
el.serviceHistoryFilterCode.addEventListener("input", refreshServiceHistory);
el.serviceHistoryFilterAction.addEventListener("change", refreshServiceHistory);
el.wizardPrev.addEventListener("click", () => moveWizard(-1));
el.wizardNext.addEventListener("click", () => moveWizard(1));

boot();

async function boot() {
  setupTabs();
  setupAccordionUX();
  setupBackToTopUX();
  await refreshColumns();
  await refreshCatalogs();
  await refreshProductsAdmin();
  await refreshHistory();
  await refreshServiceColumns();
  await refreshServices();
  await refreshServiceHistory();
  await refreshProductTypes();
  renderQuoteItemsHead();
  renderQuoteServicesHead();
  renderQuoteServices();
  renderQuoteProductTypeSelect();
  renderQuoteProductTypes();
  await refreshQuoteHistory();
  initWizard();
}

function initWizard() {
  renderWizard();
}

function renderWizard() {
  const steps = Array.from(document.querySelectorAll(".wizard-step"));
  steps.forEach((x) => x.classList.toggle("active", Number(x.dataset.step) === state.wizardStep));
  el.wizardStepLabel.textContent = `Paso ${state.wizardStep} de 5`;
  el.wizardBarFill.style.width = `${(state.wizardStep / 5) * 100}%`;
  el.wizardPrev.disabled = state.wizardStep === 1;
  el.wizardNext.textContent = state.wizardStep === 5 ? "Finalizar" : "Siguiente";
}

function moveWizard(delta) {
  clearWizardErrors();
  if (delta > 0 && !validateWizardStep(state.wizardStep)) return;
  const next = state.wizardStep + delta;
  if (next < 1 || next > 5) return;
  state.wizardStep = next;
  renderWizard();
}

function validateWizardStep(step) {
  if (step !== 1) return true;
  let ok = true;
  const nit = el.customerNit.value.trim();
  const company = el.customerCompanyName.value.trim();
  const contact = el.customerContact.value.trim();
  const project = el.customerProject.value.trim();
  const location = el.customerLocation.value.trim();
  const phone = el.customerPhone.value.trim();
  const email = el.customerEmail.value.trim();
  const taxRate = Number(el.taxRate.value);

  ok = setFieldError("errCustomerNit", /^\d{8,}$/.test(nit) ? "" : "NIT invalido (minimo 8 digitos)") && ok;
  ok = setFieldError("errCustomerCompanyName", company ? "" : "Empresa obligatoria") && ok;
  ok = setFieldError("errCustomerContact", contact ? "" : "Contacto obligatorio") && ok;
  ok = setFieldError("errCustomerProject", project ? "" : "Proyecto obligatorio") && ok;
  ok = setFieldError("errCustomerLocation", location ? "" : "Ubicacion obligatoria") && ok;
  ok = setFieldError("errCustomerPhone", /^[+]?\d{7,15}$/.test(phone) ? "" : "Telefono invalido") && ok;
  ok = setFieldError("errCustomerEmail", /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? "" : "Correo invalido") && ok;
  ok = setFieldError("errTaxRate", Number.isFinite(taxRate) && taxRate >= 0 && taxRate <= 100 ? "" : "IVA debe estar entre 0 y 100") && ok;

  if (!ok) showWizardError("Corrige los campos obligatorios antes de continuar.");
  return ok;
}

function setFieldError(id, message) {
  const node = document.getElementById(id);
  if (!node) return !message;
  node.textContent = message;
  return !message;
}

function showWizardError(message) {
  el.wizardError.hidden = false;
  el.wizardError.textContent = message;
}

function clearWizardErrors() {
  el.wizardError.hidden = true;
  el.wizardError.textContent = "";
  ["errCustomerNit","errCustomerCompanyName","errCustomerContact","errCustomerProject","errCustomerLocation","errCustomerPhone","errCustomerEmail","errTaxRate"]
    .forEach((id) => setFieldError(id, ""));
}

function setupTabs() {
  const tabs = Array.from(document.querySelectorAll(".tab-btn"));
  const panels = Array.from(document.querySelectorAll(".tab-panel"));
  const activate = (tabName) => {
    if (!tabName) return;
    tabs.forEach((t) => t.classList.toggle("active", t.dataset.tab === tabName));
    panels.forEach((p) => p.classList.toggle("active", p.dataset.tab === tabName));
    window.localStorage.setItem("smartcouplers.activeTab", tabName);
  };

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      activate(tab.dataset.tab);
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });

  const fromStorage = window.localStorage.getItem("smartcouplers.activeTab");
  if (fromStorage && panels.some((p) => p.dataset.tab === fromStorage)) {
    activate(fromStorage);
  }
}

function setupAccordionUX() {
  const accordions = Array.from(document.querySelectorAll(".accordion"));
  accordions.forEach((item) => {
    item.addEventListener("toggle", () => {
      if (!item.open) return;
      accordions.forEach((other) => {
        if (other !== item) other.open = false;
      });
    });
  });
}

function setupBackToTopUX() {
  const button = document.getElementById("btnBackToTop");
  const update = () => {
    if (window.scrollY > 380) button.classList.add("show");
    else button.classList.remove("show");
  };
  window.addEventListener("scroll", update, { passive: true });
  update();
}

async function refreshColumns() {
  const data = await fetch(`${API}/api/products/columns`).then(handleJsonResponse);
  state.columns = data.columns || [];
  renderColumns();
  renderQuoteItemsHead();
}

function renderColumns() {
  el.adminColumnsBody.innerHTML = state.columns
    .map((c) => `<tr><td>${c.key}</td><td>${c.label}</td><td>${c.required}</td><td>${c.fixed}</td></tr>`)
    .join("");
}

function renderQuoteItemsHead() {
  const dynamic = state.columns.filter((c) => !c.fixed);
  const headers = ["CODIGO", "DESCRIPCION", "DIAMETRO", "CANTIDAD", "P. UNITARIO($)", "TOTAL($)", ...dynamic.map((c) => c.label), "ACCIONES"];
  el.quoteItemsHead.innerHTML = headers.map((h) => `<th>${h}</th>`).join("");
}

async function addColumn() {
  const btn = document.getElementById("btnAddColumn");
  setLoading(btn, true);
  try {
    const payload = {
      key: el.adminColumnKey.value.trim(),
      label: el.adminColumnLabel.value.trim(),
      required: el.adminColumnRequired.value === "true"
    };
    const response = await fetch(`${API}/api/products/columns`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    await handleJsonResponse(response);
    showStatus(el.adminColumnResult, "Columna agregada correctamente.", "ok");
    await refreshColumns();
    await refreshProductsAdmin();
    renderItems();
  } catch (error) {
    showStatus(el.adminColumnResult, error.message, "error");
  } finally {
    setLoading(btn, false);
  }
}

async function deleteColumn() {
  try {
    const key = el.adminColumnDeleteKey.value.trim().toLowerCase();
    if (!key) throw new Error("Ingresa la key a eliminar.");
    const response = await fetch(`${API}/api/products/columns/${encodeURIComponent(key)}`, { method: "DELETE" });
    await handleJsonResponse(response);
    showStatus(el.adminColumnResult, "Columna eliminada.", "ok");
    await refreshColumns();
    await refreshProductsAdmin();
    renderItems();
  } catch (error) {
    showStatus(el.adminColumnResult, error.message, "error");
  }
}

async function refreshCatalogs() {
  const productsResp = await fetch(`${API}/api/catalog/products`).then(handleJsonResponse);
  state.products = productsResp.products || [];
  renderProducts();
  syncSelectedProductPrice();
  renderQuoteServiceSelect();
  syncSelectedQuoteServicePrice();
  renderQuoteProductTypeSelect();
}

function renderProducts() {
  el.productSelect.innerHTML = state.products
    .map((p) => `<option value="${p.product_code}">${p.product_code} - ${p.product_name}</option>`)
    .join("");
}

function syncSelectedProductPrice() {
  const code = el.productSelect.value;
  const product = state.products.find((p) => p.product_code === code);
  el.itemUnitPrice.value = product ? Number(product.unit_price) : "";
}

function renderQuoteServiceSelect() {
  const active = (state.services || []).filter((s) => s.active);
  el.quoteServiceSelect.innerHTML = active
    .map((s) => `<option value="${s.service_code}">${s.service_code} - ${s.description}</option>`)
    .join("");
}

function renderQuoteProductTypeSelect() {
  const active = (state.productTypes || []).filter((t) => t.active);
  el.quoteProductTypeSelect.innerHTML = active
    .map((t) => `<option value="${t.type_code}">${t.type_code} - ${escapeHtml(t.comment)}</option>`)
    .join("");
}

function syncSelectedQuoteServicePrice() {
  const code = el.quoteServiceSelect.value;
  const service = (state.services || []).find((s) => s.service_code === code);
  el.quoteServiceUnitPrice.value = service ? Number(service.unit_price) : "";
}

async function createProductAdmin() {
  const btn = document.getElementById("btnAdminCreateProduct");
  setLoading(btn, true);
  try {
    const payload = readAdminProductForm();
    const response = await fetch(`${API}/api/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await handleJsonResponse(response);
    showStatus(el.adminProductResult, `Producto ${data.product.product_code} creado correctamente.`, "ok");
    await refreshCatalogs();
    await refreshProductsAdmin();
    await refreshHistory();
  } catch (error) {
    showStatus(el.adminProductResult, error.message, "error");
  } finally {
    setLoading(btn, false);
  }
}

async function updateProductAdmin() {
  try {
    const payload = readAdminProductForm();
    const response = await fetch(`${API}/api/products/${encodeURIComponent(payload.product_code)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await handleJsonResponse(response);
    showStatus(el.adminProductResult, `Producto ${data.product.product_code} actualizado correctamente.`, "ok");
    await refreshCatalogs();
    await refreshProductsAdmin();
    await refreshHistory();
  } catch (error) {
    showStatus(el.adminProductResult, error.message, "error");
  }
}

function readAdminProductForm() {
  const quantity = Number(el.adminProductQuantity.value);
  const unitPrice = Number(el.adminProductPrice.value);
  const payload = {
    product_code: el.adminProductCode.value.trim(),
    product_name: el.adminProductName.value.trim(),
    diameter: el.adminProductDiameter.value.trim(),
    quantity: Number.isFinite(quantity) && quantity > 0 ? quantity : 1,
    unit_price: unitPrice,
    total: (Number.isFinite(quantity) && quantity > 0 ? quantity : 1) * unitPrice,
    currency: el.adminProductCurrency.value.trim() || "COP",
    active: el.adminProductActive.value === "true",
    changedBy: el.adminChangedBy.value.trim()
  };

  const dynamic = state.columns.filter((c) => !c.fixed);
  dynamic.forEach((c) => {
    const ask = prompt(`Valor para columna ${c.label} (${c.key})`, "");
    payload[c.key] = ask ?? "";
  });

  return payload;
}

async function deleteProductAdmin() {
  try {
    const code = el.adminProductCode.value.trim();
    if (!code) throw new Error("Ingresa el codigo del producto a eliminar.");
    const ok = confirm(`Se eliminara el producto ${code} del inventario. Continuar?`);
    if (!ok) return;

    const changedBy = encodeURIComponent(el.adminChangedBy.value.trim() || "app-user");
    const response = await fetch(`${API}/api/products/${encodeURIComponent(code)}?changedBy=${changedBy}`, {
      method: "DELETE"
    });
    const data = await handleJsonResponse(response);
    showStatus(el.adminProductResult, `Producto ${data.product_code} eliminado del inventario.`, "ok");
    await refreshCatalogs();
    await refreshProductsAdmin();
    await refreshHistory();
  } catch (error) {
    showStatus(el.adminProductResult, error.message, "error");
  }
}

async function refreshProductsAdmin() {
  const data = await fetch(`${API}/api/products?includeInactive=true`).then(handleJsonResponse);
  const dynamic = state.columns.filter((c) => !c.fixed);
  const head = [
    "CODIGO",
    "DESCRIPCION",
    "DIAMETRO",
    "CANTIDAD",
    "P. UNITARIO($)",
    "TOTAL($)",
    ...dynamic.map((c) => c.label),
    "ACTIVO"
  ];
  el.adminProductsHead.innerHTML = head.map((h) => `<th>${h}</th>`).join("");

  el.adminProductsBody.innerHTML = (data.products || [])
    .map((p) => {
      const dynamicCells = dynamic.map((c) => `<td>${escapeHtml(String(p?.extras?.[c.key] ?? "-"))}</td>`).join("");
      return `<tr>
        <td>${escapeHtml(p.product_code)}</td>
        <td>${escapeHtml(p.product_name)}</td>
        <td>${escapeHtml(p.diameter || "-")}</td>
        <td>${p.quantity ?? 1}</td>
        <td>${formatMoney(p.unit_price)}</td>
        <td>${formatMoney((p.quantity ?? 1) * Number(p.unit_price || 0))}</td>
        ${dynamicCells}
        <td>${p.active}</td>
      </tr>`;
    })
    .join("");
}

async function refreshHistory() {
  const data = await fetch(`${API}/api/products/history`).then(handleJsonResponse);
  const codeFilter = el.historyFilterCode.value.trim().toLowerCase();
  const actionFilter = el.historyFilterAction.value.trim().toLowerCase();
  const rows = (data.logs || []).slice(0, 20);
  const filtered = rows.filter((x) => {
    const codeOk = !codeFilter || String(x.product_code || "").toLowerCase().includes(codeFilter);
    const actionOk = !actionFilter || String(x.action || "").toLowerCase() === actionFilter;
    return codeOk && actionOk;
  });

  el.adminHistoryBody.innerHTML = filtered.length
    ? filtered
        .map((x) => {
          const beforePrice = x.before?.unit_price ?? "-";
          const afterPrice = x.after?.unit_price ?? "-";
          return `<tr><td>${shortDate(x.at)}</td><td>${x.action}</td><td>${x.product_code}</td><td>${x.changed_by}</td><td>${beforePrice}</td><td>${afterPrice}</td></tr>`;
        })
        .join("")
    : `<tr><td colspan="6">Sin cambios registrados.</td></tr>`;
}

async function refreshServiceColumns() {
  const data = await fetch(`${API}/api/services/columns`).then(handleJsonResponse);
  state.serviceColumns = data.columns || [];
  el.serviceColumnsBody.innerHTML = state.serviceColumns
    .map((c) => `<tr><td>${c.key}</td><td>${c.label}</td><td>${c.required}</td><td>${c.fixed}</td></tr>`)
    .join("");
}

async function addServiceColumn() {
  try {
    const payload = {
      key: el.serviceColumnKey.value.trim(),
      label: el.serviceColumnLabel.value.trim(),
      required: el.serviceColumnRequired.value === "true"
    };
    const response = await fetch(`${API}/api/services/columns`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    await handleJsonResponse(response);
    showStatus(el.serviceColumnResult, "Columna de servicio agregada.", "ok");
    await refreshServiceColumns();
    await refreshServices();
  } catch (error) {
    showStatus(el.serviceColumnResult, error.message, "error");
  }
}

async function deleteServiceColumn() {
  try {
    const key = el.serviceColumnDeleteKey.value.trim().toLowerCase();
    if (!key) throw new Error("Ingresa la key de columna de servicio.");
    const response = await fetch(`${API}/api/services/columns/${encodeURIComponent(key)}`, { method: "DELETE" });
    await handleJsonResponse(response);
    showStatus(el.serviceColumnResult, "Columna de servicio eliminada.", "ok");
    await refreshServiceColumns();
    await refreshServices();
  } catch (error) {
    showStatus(el.serviceColumnResult, error.message, "error");
  }
}

function readServiceForm() {
  const unitPrice = Number(el.serviceUnitPrice.value);
  const payload = {
    service_code: el.serviceCode.value.trim(),
    description: el.serviceDescription.value.trim(),
    unit: el.serviceUnit.value.trim(),
    unit_price: unitPrice,
    total: unitPrice,
    active: el.serviceActive.value === "true",
    changedBy: el.serviceChangedBy.value.trim()
  };
  const dyn = state.serviceColumns.filter((c) => !c.fixed);
  dyn.forEach((c) => {
    const ask = prompt(`Valor para columna ${c.label} (${c.key})`, "");
    payload[c.key] = ask ?? "";
  });
  return payload;
}

async function createService() {
  const btn = document.getElementById("btnCreateService");
  setLoading(btn, true);
  try {
    const payload = readServiceForm();
    const response = await fetch(`${API}/api/services`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await handleJsonResponse(response);
    showStatus(el.serviceResult, `Servicio ${data.service.service_code} creado.`, "ok");
    await refreshServices();
    await refreshServiceHistory();
  } catch (error) {
    showStatus(el.serviceResult, error.message, "error");
  } finally {
    setLoading(btn, false);
  }
}

async function updateService() {
  try {
    const payload = readServiceForm();
    const response = await fetch(`${API}/api/services/${encodeURIComponent(payload.service_code)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await handleJsonResponse(response);
    showStatus(el.serviceResult, `Servicio ${data.service.service_code} actualizado.`, "ok");
    await refreshServices();
    await refreshServiceHistory();
  } catch (error) {
    showStatus(el.serviceResult, error.message, "error");
  }
}

async function deleteService() {
  try {
    const code = el.serviceCode.value.trim();
    if (!code) throw new Error("Ingresa el codigo del servicio a eliminar.");
    const changedBy = encodeURIComponent(el.serviceChangedBy.value.trim() || "app-user");
    const response = await fetch(`${API}/api/services/${encodeURIComponent(code)}?changedBy=${changedBy}`, { method: "DELETE" });
    const data = await handleJsonResponse(response);
    showStatus(el.serviceResult, `Servicio ${data.service_code} eliminado.`, "ok");
    await refreshServices();
    await refreshServiceHistory();
  } catch (error) {
    showStatus(el.serviceResult, error.message, "error");
  }
}

async function refreshServices() {
  const data = await fetch(`${API}/api/services?includeInactive=true`).then(handleJsonResponse);
  state.services = data.services || [];
  const dyn = state.serviceColumns.filter((c) => !c.fixed);
  const head = ["CODIGO", "DESCRIPCIÓN", "Und.", "P. UNITARIO ($)", "TOTAL ($)", ...dyn.map((c) => c.label), "ACTIVO"];
  el.servicesHead.innerHTML = head.map((h) => `<th>${h}</th>`).join("");
  el.servicesBody.innerHTML = state.services.length
    ? state.services
        .map((s) => {
          const dynCells = dyn.map((c) => `<td>${escapeHtml(String(s?.extras?.[c.key] ?? "-"))}</td>`).join("");
          return `<tr><td>${escapeHtml(s.service_code)}</td><td>${escapeHtml(s.description)}</td><td>${escapeHtml(s.unit)}</td><td>${formatMoney(s.unit_price)}</td><td>${formatMoney(s.total)}</td>${dynCells}<td>${s.active}</td></tr>`;
        })
        .join("")
    : `<tr><td colspan="${7 + dyn.length}">Sin servicios registrados.</td></tr>`;
  renderQuoteServiceSelect();
  syncSelectedQuoteServicePrice();
  renderQuoteServicesHead();
  renderQuoteServices();
}

async function refreshServiceHistory() {
  const data = await fetch(`${API}/api/services/history`).then(handleJsonResponse);
  const codeFilter = el.serviceHistoryFilterCode.value.trim().toLowerCase();
  const actionFilter = el.serviceHistoryFilterAction.value.trim().toLowerCase();
  const rows = (data.logs || []).slice(0, 50).filter((x) => {
    const c = !codeFilter || String(x.service_code || "").toLowerCase().includes(codeFilter);
    const a = !actionFilter || String(x.action || "").toLowerCase() === actionFilter;
    return c && a;
  });
  el.serviceHistoryBody.innerHTML = rows.length
    ? rows
        .map((x) => {
          const beforePrice = x.before?.unit_price ?? "-";
          const afterPrice = x.after?.unit_price ?? "-";
          return `<tr><td>${shortDate(x.at)}</td><td>${x.action}</td><td>${x.service_code}</td><td>${x.changed_by}</td><td>${beforePrice}</td><td>${afterPrice}</td></tr>`;
        })
        .join("")
    : `<tr><td colspan="6">Sin cambios registrados.</td></tr>`;
}

function readProductTypeForm() {
  return {
    type_code: el.productTypeCode.value.trim(),
    comment: el.productTypeComment.value.trim(),
    active: el.productTypeActive.value === "true",
    changedBy: el.productTypeChangedBy.value.trim()
  };
}

async function createProductType() {
  const btn = document.getElementById("btnCreateProductType");
  setLoading(btn, true);
  try {
    const payload = readProductTypeForm();
    const response = await fetch(`${API}/api/product-types`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await handleJsonResponse(response);
    showStatus(el.productTypeResult, `Tipo ${data.productType.type_code} creado.`, "ok");
    await refreshProductTypes();
  } catch (error) {
    showStatus(el.productTypeResult, error.message, "error");
  } finally {
    setLoading(btn, false);
  }
}

async function updateProductType() {
  try {
    const payload = readProductTypeForm();
    const response = await fetch(`${API}/api/product-types/${encodeURIComponent(payload.type_code)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await handleJsonResponse(response);
    showStatus(el.productTypeResult, `Tipo ${data.productType.type_code} actualizado.`, "ok");
    await refreshProductTypes();
  } catch (error) {
    showStatus(el.productTypeResult, error.message, "error");
  }
}

async function deleteProductType() {
  try {
    const code = el.productTypeCode.value.trim();
    if (!code) throw new Error("Ingresa el codigo del tipo a eliminar.");
    const changedBy = encodeURIComponent(el.productTypeChangedBy.value.trim() || "app-user");
    const response = await fetch(`${API}/api/product-types/${encodeURIComponent(code)}?changedBy=${changedBy}`, {
      method: "DELETE"
    });
    const data = await handleJsonResponse(response);
    showStatus(el.productTypeResult, `Tipo ${data.type_code} eliminado.`, "ok");
    await refreshProductTypes();
  } catch (error) {
    showStatus(el.productTypeResult, error.message, "error");
  }
}

async function refreshProductTypes() {
  const data = await fetch(`${API}/api/product-types?includeInactive=true`).then(handleJsonResponse);
  state.productTypes = data.productTypes || [];
  el.productTypesBody.innerHTML = state.productTypes.length
    ? state.productTypes
        .map((t) => `<tr><td>${escapeHtml(t.type_code)}</td><td>${escapeHtml(t.comment)}</td><td>${t.active}</td></tr>`)
        .join("")
    : `<tr><td colspan="3">Sin tipos de producto registrados.</td></tr>`;
  renderQuoteProductTypeSelect();
  renderQuoteProductTypes();
}

function addItem() {
  const productCode = el.productSelect.value;
  const product = state.products.find((p) => p.product_code === productCode);
  if (!product) return alert("Selecciona un producto valido.");

  const quantity = Number(el.itemQty.value);
  const unitPrice = Number(el.itemUnitPrice.value);
  if (!Number.isInteger(quantity) || quantity <= 0) return alert("Cantidad invalida (entero mayor a 0).");
  if (!Number.isFinite(unitPrice) || unitPrice <= 0) return alert("Precio unitario invalido (mayor a 0).");

  state.items.push({
    product_code: product.product_code,
    description: product.product_name,
    diameter: product.diameter || "",
    quantity,
    unit_price: unitPrice,
    extras: product.extras || {}
  });
  el.itemQty.value = "1";
  renderItems();
}

function renderItems() {
  const dynamic = state.columns.filter((c) => !c.fixed);
  if (!state.items.length) {
    el.itemsTableBody.innerHTML = `<tr><td colspan="${7 + dynamic.length}">No hay items agregados.</td></tr>`;
    return;
  }

  el.itemsTableBody.innerHTML = state.items.map((item, idx) => {
    const dynamicCells = dynamic.map((c) => `<td>${escapeHtml(String(item?.extras?.[c.key] ?? "-"))}</td>`).join("");
    return `
    <tr>
      <td>${escapeHtml(item.product_code)}</td>
      <td>${escapeHtml(item.description)}</td>
      <td>${escapeHtml(item.diameter || "-")}</td>
      <td>${item.quantity}</td>
      <td>${formatMoney(item.unit_price)}</td>
      <td>${formatMoney(item.quantity * item.unit_price)}</td>
      ${dynamicCells}
      <td class="actions">
        <button type="button" data-action="edit" data-index="${idx}">Editar cantidad</button>
        <button type="button" data-action="remove" data-index="${idx}">Quitar</button>
      </td>
    </tr>`;
  }).join("");

  el.itemsTableBody.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => {
      const idx = Number(button.dataset.index);
      if (button.dataset.action === "remove") state.items.splice(idx, 1);
      if (button.dataset.action === "edit") {
        const next = Number(prompt("Nueva cantidad:", String(state.items[idx].quantity)));
        if (Number.isFinite(next) && next > 0) state.items[idx].quantity = next;
      }
      renderItems();
    });
  });
}

function renderQuoteServicesHead() {
  const dyn = state.serviceColumns.filter((c) => !c.fixed);
  const headers = ["CODIGO", "DESCRIPCIÓN", "Und.", "CANTIDAD", "P. UNITARIO ($)", "TOTAL ($)", ...dyn.map((c) => c.label), "ACCIONES"];
  el.quoteServicesHead.innerHTML = headers.map((h) => `<th>${h}</th>`).join("");
}

function addQuoteService() {
  const code = el.quoteServiceSelect.value;
  const service = (state.services || []).find((s) => s.service_code === code && s.active);
  if (!service) return alert("Selecciona un servicio válido.");
  const quantity = Number(el.quoteServiceQty.value);
  const unitPrice = Number(el.quoteServiceUnitPrice.value);
  if (!Number.isInteger(quantity) || quantity <= 0) return alert("Cantidad invalida (entero mayor a 0).");
  if (!Number.isFinite(unitPrice) || unitPrice <= 0) return alert("Precio unitario invalido (mayor a 0).");

  state.quoteServices.push({
    service_code: service.service_code,
    description: service.description,
    unit: service.unit,
    quantity,
    unit_price: unitPrice,
    extras: service.extras || {}
  });
  el.quoteServiceQty.value = "1";
  renderQuoteServices();
}

function renderQuoteServices() {
  const dyn = state.serviceColumns.filter((c) => !c.fixed);
  if (!state.quoteServices.length) {
    el.quoteServicesBody.innerHTML = `<tr><td colspan="${8 + dyn.length}">No hay servicios agregados.</td></tr>`;
    return;
  }
  el.quoteServicesBody.innerHTML = state.quoteServices.map((s, idx) => {
    const dynCells = dyn.map((c) => `<td>${escapeHtml(String(s?.extras?.[c.key] ?? "-"))}</td>`).join("");
    return `<tr>
      <td>${escapeHtml(s.service_code)}</td>
      <td>${escapeHtml(s.description)}</td>
      <td>${escapeHtml(s.unit)}</td>
      <td>${s.quantity}</td>
      <td>${formatMoney(s.unit_price)}</td>
      <td>${formatMoney(s.quantity * s.unit_price)}</td>
      ${dynCells}
      <td class="actions">
        <button type="button" data-action="edit" data-index="${idx}">Editar cantidad</button>
        <button type="button" data-action="remove" data-index="${idx}">Quitar</button>
      </td>
    </tr>`;
  }).join("");

  el.quoteServicesBody.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => {
      const idx = Number(button.dataset.index);
      if (button.dataset.action === "remove") state.quoteServices.splice(idx, 1);
      if (button.dataset.action === "edit") {
        const next = Number(prompt("Nueva cantidad:", String(state.quoteServices[idx].quantity)));
        if (Number.isFinite(next) && next > 0) state.quoteServices[idx].quantity = next;
      }
      renderQuoteServices();
    });
  });
}

function addQuoteProductType() {
  const code = el.quoteProductTypeSelect.value;
  const type = (state.productTypes || []).find((t) => t.type_code === code && t.active);
  if (!type) return alert("Selecciona un tipo de producto valido.");
  if (state.quoteProductTypes.some((x) => x.type_code === type.type_code)) {
    return alert("Ese tipo de producto ya fue agregado.");
  }
  state.quoteProductTypes.push({ type_code: type.type_code, comment: type.comment });
  renderQuoteProductTypes();
}

function renderQuoteProductTypes() {
  if (!state.quoteProductTypes.length) {
    el.quoteProductTypesBody.innerHTML = `<tr><td colspan="3">No hay tipos de producto seleccionados.</td></tr>`;
    return;
  }
  el.quoteProductTypesBody.innerHTML = state.quoteProductTypes
    .map(
      (t, idx) => `<tr>
      <td>${escapeHtml(t.type_code)}</td>
      <td>${escapeHtml(t.comment)}</td>
      <td class="actions">
        <button type="button" data-action="edit" data-index="${idx}">Editar comentario</button>
        <button type="button" data-action="remove" data-index="${idx}">Quitar</button>
      </td>
    </tr>`
    )
    .join("");

  el.quoteProductTypesBody.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => {
      const idx = Number(button.dataset.index);
      if (button.dataset.action === "remove") state.quoteProductTypes.splice(idx, 1);
      if (button.dataset.action === "edit") {
        const next = prompt("Nuevo comentario:", String(state.quoteProductTypes[idx].comment || ""));
        if (next !== null && String(next).trim()) state.quoteProductTypes[idx].comment = String(next).trim();
      }
      renderQuoteProductTypes();
    });
  });
}

async function createQuote() {
  clearWizardErrors();
  if (!validateWizardStep(1)) {
    state.wizardStep = 1;
    renderWizard();
    return;
  }
  if (!state.items.length) return alert("Agrega al menos un item.");
  if (!state.quoteProductTypes.length) return alert("Debes elegir al menos un tipo de producto.");

  const payload = {
    customer: {
      nit: el.customerNit.value.trim(),
      company_name: el.customerCompanyName.value.trim(),
      contact: el.customerContact.value.trim(),
      project: el.customerProject.value.trim(),
      location: el.customerLocation.value.trim(),
      email: el.customerEmail.value.trim(),
      phone: el.customerPhone.value.trim()
    },
    items: state.items.map((x) => ({ product_code: x.product_code, quantity: x.quantity, unit_price: x.unit_price })),
    services: state.quoteServices.map((s) => ({ service_code: s.service_code, quantity: s.quantity, unit_price: s.unit_price })),
    product_types: state.quoteProductTypes.map((t) => ({ type_code: t.type_code })),
    taxRate: Number(el.taxRate.value || 0)
  };

  const btn = document.getElementById("btnCreateQuote");
  setLoading(btn, true);
  try {
    const response = await fetch(`${API}/api/quotes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await handleJsonResponse(response);
    showStatus(
      el.quoteResult,
      `Cotizacion ${data.quote.quote_number} emitida. Total general: ${formatMoney(data.quote.totals.grand_total ?? data.quote.totals.total)} COP`,
      "ok"
    );
    if (data.ok) {
      state.lastQuoteNumber = data.quote.quote_number;
      renderQuotePreview(data.quote);
      state.items = [];
      state.quoteServices = [];
      state.quoteProductTypes = [];
      renderItems();
      renderQuoteServices();
      renderQuoteProductTypes();
      await refreshQuoteHistory();
    }
  } catch (error) {
    showStatus(el.quoteResult, error.message, "error");
  } finally {
    setLoading(btn, false);
  }
}

async function generateDocuments() {
  if (!state.lastQuoteNumber) {
    showStatus(el.docResult, "Primero emite una cotizacion para generar documentos.", "error");
    return;
  }

  const btn = document.getElementById("btnGenerateDocs");
  setLoading(btn, true);
  try {
    const response = await fetch(`${API}/api/quotes/${encodeURIComponent(state.lastQuoteNumber)}/export-pdf`, {
      method: "POST"
    });
    const data = await handleJsonResponse(response);
    await triggerDownload(state.lastQuoteNumber, "docx");
    let msg = "Word descargado.";
    if (data.pdf_path) {
      await triggerDownload(state.lastQuoteNumber, "pdf");
      msg += " PDF descargado.";
    } else {
      msg += data.warning ? ` PDF no generado: ${data.warning}` : " PDF no generado.";
    }
    showStatus(el.docResult, msg, "ok");
  } catch (error) {
    showStatus(el.docResult, error.message, "error");
  } finally {
    setLoading(btn, false);
  }
}

async function downloadTemplate() {
  try {
    const response = await fetch(`${API}/api/template/docx`);
    if (!response.ok) {
      const raw = await response.text();
      throw new Error(raw || "No se pudo descargar la plantilla");
    }
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = objectUrl;
    a.download = "plantilla_cotizacion_actual.docx";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(objectUrl);
    showStatus(el.docResult, "Plantilla descargada.", "ok");
  } catch (error) {
    showStatus(el.docResult, error.message, "error");
  }
}

async function clearAllHistory() {
  const ok = confirm(
    "Se eliminara el historial de productos, servicios y cotizaciones emitidas. Esta accion no se puede deshacer. Continuar?"
  );
  if (!ok) return;

  try {
    let response = await fetch(`${API}/api/history?scope=all`, { method: "DELETE" });
    if (response.status === 404 || response.status === 405) {
      response = await fetch(`${API}/api/history/clear?scope=all`, { method: "POST" });
    }
    const data = await handleJsonResponse(response);
    showStatus(
      el.historyClearResult,
      `Historial eliminado. Registros: productos ${data.cleared.products_logs}, servicios ${data.cleared.services_logs}, cotizaciones ${data.cleared.quotes_files}.`,
      "ok"
    );
    await refreshHistory();
    await refreshServiceHistory();
    await refreshQuoteHistory();
    el.quotePreview.innerHTML = `<p class="muted">No hay cotizaciones en historial. Emite una nueva para previsualizar.</p>`;
    state.lastQuoteNumber = "";
  } catch (error) {
    showStatus(el.historyClearResult, error.message, "error");
  }
}

async function uploadTemplate() {
  const btn = document.getElementById("btnUploadTemplate");
  setLoading(btn, true);
  try {
    const file = el.templateFileInput.files?.[0];
    if (!file) throw new Error("Selecciona un archivo .docx");
    if (!file.name.toLowerCase().endsWith(".docx")) throw new Error("El archivo debe ser .docx");

    const bytes = await file.arrayBuffer();
    const response = await fetch(`${API}/api/template/docx`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/octet-stream",
        "x-filename": file.name
      },
      body: bytes
    });
    const data = await handleJsonResponse(response);
    showStatus(el.docResult, `${data.message}.`, "ok");
  } catch (error) {
    showStatus(el.docResult, error.message, "error");
  } finally {
    setLoading(btn, false);
  }
}

function renderQuotePreview(quote) {
  const rows = (quote.items || [])
    .map(
      (item) =>
        `<tr><td>${escapeHtml(item.product_code)}</td><td>${escapeHtml(item.description)}</td><td>${escapeHtml(item.diameter || "-")}</td><td>${item.quantity}</td><td>${formatMoney(item.unit_price)}</td><td>${formatMoney(item.item_total)}</td></tr>`
    )
    .join("");
  const serviceRows = (quote.services || [])
    .map(
      (s) =>
        `<tr><td>${escapeHtml(s.service_code)}</td><td>${escapeHtml(s.description)}</td><td>${escapeHtml(s.unit || "-")}</td><td>${s.quantity}</td><td>${formatMoney(s.unit_price)}</td><td>${formatMoney(s.total)}</td></tr>`
    )
    .join("");
  const productTypeRows = (quote.product_types || [])
    .map((t) => `<li>${escapeHtml(t.comment || "")}</li>`)
    .join("");

  el.quotePreview.innerHTML = `
    <p><strong>Cotizacion seleccionada:</strong> ${quote.quote_number}</p>
    <p><strong>Cliente:</strong> ${escapeHtml(quote.customer.company_name)} (${escapeHtml(quote.customer.nit)})</p>
    <p><strong>Fecha:</strong> ${escapeHtml(String(quote.emitted_at || "").slice(0, 10))}</p>
    <p><strong>Productos:</strong></p>
    <table width="100%" border="1" cellspacing="0" cellpadding="6">
      <thead><tr><th>CODIGO</th><th>DESCRIPCION</th><th>DIAMETRO</th><th>CANTIDAD</th><th>P. UNITARIO ($)</th><th>TOTAL ($)</th></tr></thead>
      <tbody>${rows || "<tr><td colspan='6'>Sin productos</td></tr>"}</tbody>
    </table>
    <p><strong>Servicios:</strong></p>
    <table width="100%" border="1" cellspacing="0" cellpadding="6">
      <thead><tr><th>CODIGO</th><th>DESCRIPCION</th><th>UND.</th><th>CANTIDAD</th><th>P. UNITARIO ($)</th><th>TOTAL ($)</th></tr></thead>
      <tbody>${serviceRows || "<tr><td colspan='6'>No se solicito el servicio (descripcion)</td></tr>"}</tbody>
    </table>
    <p><strong>Tipo de producto (comentarios):</strong></p>
    <ul>${productTypeRows || "<li>Sin tipos seleccionados</li>"}</ul>
    <p><strong>Totales productos:</strong> Subtotal ${formatMoney(quote.totals.products_subtotal ?? 0)} | IVA ${formatMoney(quote.totals.products_tax_amount ?? 0)} | Total ${formatMoney(quote.totals.products_total ?? 0)}</p>
    <p><strong>Totales servicios:</strong> Subtotal ${formatMoney(quote.totals.services_subtotal ?? 0)} | IVA ${formatMoney(quote.totals.services_tax_amount ?? 0)} | Total ${formatMoney(quote.totals.services_total ?? 0)}</p>
    <p><strong>Total general:</strong> ${formatMoney(quote.totals.grand_total ?? quote.totals.total ?? 0)}</p>`;
}

async function triggerDownload(quoteNumber, kind) {
  const url = `${API}/api/quotes/${encodeURIComponent(quoteNumber)}/download/${kind}`;
  const response = await fetch(url);
  if (!response.ok) {
    const raw = await response.text();
    throw new Error(`No se pudo descargar ${kind.toUpperCase()}: ${raw}`);
  }
  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = objectUrl;
  a.download = `${quoteNumber}.${kind}`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(objectUrl);
}

async function lookupCustomerByNit() {
  const nit = el.customerNit.value.trim();
  if (!nit) return;
  const response = await fetch(`${API}/api/customers/${encodeURIComponent(nit)}`);
  if (!response.ok) return;
  const data = await handleJsonResponse(response);
  if (!data.customer) return;
  const c = data.customer;
  el.customerCompanyName.value = c.company_name || "";
  el.customerContact.value = c.contact || "";
  el.customerProject.value = c.project || "";
  el.customerLocation.value = c.location || "";
  el.customerPhone.value = c.phone || "";
  el.customerEmail.value = c.email || "";
}

function formatMoney(value) {
  return Number(value || 0).toLocaleString("es-CO", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

function showStatus(target, message, type) {
  target.className = `status-box ${type === "error" ? "status-error" : "status-ok"}`;
  target.textContent = message;
  showToast(message, type === "error" ? "error" : "ok");
}

function showToast(message, type = "ok") {
  if (!el.toastContainer) return;
  const toast = document.createElement("article");
  toast.className = `toast ${type}`;
  toast.textContent = message;
  el.toastContainer.appendChild(toast);
  setTimeout(() => {
    toast.remove();
  }, 3200);
}

function setLoading(button, loading) {
  if (!button) return;
  if (!button.dataset.originalLabel) button.dataset.originalLabel = button.textContent;
  button.classList.toggle("loading", loading);
  button.disabled = loading;
  button.textContent = loading ? "Procesando..." : button.dataset.originalLabel;
}

function shortDate(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("es-CO");
}

function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function refreshQuoteHistory() {
  const query = encodeURIComponent(el.quoteFilterQuery.value.trim());
  const date = encodeURIComponent(el.quoteFilterDate.value.trim());
  const data = await fetch(`${API}/api/quotes?query=${query}&date=${date}`).then(handleJsonResponse);
  const rows = data.quotes || [];
  el.quoteHistoryBody.innerHTML = rows.length
    ? rows
        .map(
          (q) =>
            `<tr data-quote-number="${escapeHtml(q.quote_number)}"><td>${escapeHtml(q.quote_number)}</td><td>${escapeHtml(String(q.emitted_at || "").slice(0, 10))}</td><td>${escapeHtml(q.customer_nit)}</td><td>${escapeHtml(q.customer_company_name)}</td><td>${formatMoney(q.total)}</td></tr>`
        )
        .join("")
    : `<tr><td colspan="5">Sin cotizaciones encontradas.</td></tr>`;

  el.quoteHistoryBody.querySelectorAll("tr[data-quote-number]").forEach((row) => {
    row.style.cursor = "pointer";
    row.addEventListener("click", async () => {
      const quoteNumber = row.getAttribute("data-quote-number");
      if (!quoteNumber) return;
      try {
        const data = await fetch(`${API}/api/quotes/${encodeURIComponent(quoteNumber)}`).then(handleJsonResponse);
        state.lastQuoteNumber = quoteNumber;
        renderQuotePreview(data.quote);
        showStatus(el.docResult, `Cotizacion ${quoteNumber} lista para exportar.`, "ok");
      } catch (error) {
        showStatus(el.docResult, error.message, "error");
      }
    });
  });
}

async function handleJsonResponse(response) {
  const raw = await response.text();
  let data;
  try { data = JSON.parse(raw); } catch {
    const sample = String(raw || "").replace(/\s+/g, " ").slice(0, 120);
    throw new Error(`Respuesta no JSON (${response.status}). ${sample || "Sin contenido"}`);
  }
  if (!response.ok) throw new Error(data?.errors?.join("; ") || data?.error || "Error de API");
  return data;
}
