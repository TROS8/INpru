export function validateCreateQuotePayload(payload) {
  const errors = [];

  const customer = payload?.customer || {};
  const items = Array.isArray(payload?.items) ? payload.items : [];
  const services = Array.isArray(payload?.services) ? payload.services : [];
  const productTypes = Array.isArray(payload?.product_types) ? payload.product_types : [];

  if (!String(customer.nit || "").trim()) errors.push("customer.nit es obligatorio");
  if (!String(customer.company_name || "").trim()) errors.push("customer.company_name es obligatorio");
  if (!String(customer.contact || "").trim()) errors.push("customer.contact es obligatorio");
  if (!String(customer.project || "").trim()) errors.push("customer.project es obligatorio");
  if (!String(customer.location || "").trim()) errors.push("customer.location es obligatorio");
  if (!String(customer.phone || "").trim()) errors.push("customer.phone es obligatorio");
  if (!String(customer.email || "").trim()) errors.push("customer.email es obligatorio");

  if (items.length === 0) {
    errors.push("Debe incluir al menos un item");
  }
  if (productTypes.length === 0) {
    errors.push("Debe seleccionar al menos un tipo de producto");
  }

  items.forEach((item, index) => {
    const row = index + 1;
    const productCode = String(item?.product_code || "").trim();
    const quantity = Number(item?.quantity);
    const unitPrice = Number(item?.unit_price);

    if (!productCode) errors.push(`items[${row}].product_code es obligatorio`);
    if (!Number.isFinite(quantity) || quantity <= 0) {
      errors.push(`items[${row}].quantity debe ser numerico y mayor que 0`);
    }
    if (!Number.isFinite(unitPrice) || unitPrice <= 0) {
      errors.push(`items[${row}].unit_price debe ser numerico y mayor que 0`);
    }
  });

  services.forEach((service, index) => {
    const row = index + 1;
    const serviceCode = String(service?.service_code || "").trim();
    const quantity = Number(service?.quantity);
    const unitPrice = Number(service?.unit_price);

    if (!serviceCode) errors.push(`services[${row}].service_code es obligatorio`);
    if (!Number.isFinite(quantity) || quantity <= 0) {
      errors.push(`services[${row}].quantity debe ser numerico y mayor que 0`);
    }
    if (!Number.isFinite(unitPrice) || unitPrice <= 0) {
      errors.push(`services[${row}].unit_price debe ser numerico y mayor que 0`);
    }
  });

  productTypes.forEach((item, index) => {
    const row = index + 1;
    const typeCode = String(item?.type_code || "").trim();
    if (!typeCode) errors.push(`product_types[${row}].type_code es obligatorio`);
  });

  return {
    isValid: errors.length === 0,
    errors
  };
}
