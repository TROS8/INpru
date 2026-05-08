import path from "node:path";
import fs from "node:fs";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import { getQuoteByNumber } from "../../quotes/services/quote-service.js";

const execFileAsync = promisify(execFile);

export async function exportQuoteToPdf({ quoteNumber, cfg }) {
  const found = getQuoteByNumber({ quoteNumber, cfg });
  if (!found.ok) return { ok: false, error: "Cotizacion no encontrada" };

  const templatePath = cfg.files.quoteTemplateDocx;
  if (!cfg.fs.existsSync(templatePath)) {
    return { ok: false, error: `No existe plantilla DOCX: ${templatePath}` };
  }

  const quote = found.quote;
  const quoteDir = path.dirname(found.quote_path);
  const docxOut = path.join(quoteDir, `${quote.quote_number}.docx`);

  const templateBinary = cfg.fs.readFileSync(templatePath, "binary");
  const zip = new PizZip(templateBinary);
  const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });
  const expectedTags = [
    "quote_number",
    "company_name",
    "nit",
    "contact",
    "project",
    "location",
    "email",
    "phone",
    "items_text",
    "services_text",
    "product_types_text",
    "total_fmt",
    "city_date_line"
  ];
  const hasAtLeastOneTag = templateHasAnyTag(zip, expectedTags);
  if (!hasAtLeastOneTag) {
    return {
      ok: false,
      error:
        "La plantilla Word no contiene placeholders Docxtemplater ({campo}). Debes agregar etiquetas como {company_name}, {nit}, {project}, {items_text}."
    };
  }

  const items = (quote.items || []).map((x) => ({
    codigo: x.product_code,
    descripcion: x.description,
    diametro: x.diameter || "",
    cantidad: x.quantity,
    precio_unitario: formatMoney(x.unit_price),
    total: formatMoney(x.item_total)
  }));
  const itemsText = items
    .map((x) => `${x.descripcion} | ${x.diametro} | ${x.cantidad} | ${x.precio_unitario} | ${x.total}`)
    .join("\n");
  const services = (quote.services || []).map((x) => ({
    codigo: x.service_code,
    descripcion: x.description,
    unidad: x.unit || "",
    cantidad: x.quantity,
    precio_unitario: formatMoney(x.unit_price),
    total: formatMoney(x.total)
  }));
  const servicesForTemplate =
    services.length > 0
      ? services
      : [{ codigo: "", descripcion: "No se solicito el servicio", unidad: "", cantidad: "", precio_unitario: "", total: "" }];
  const servicesText =
    services.length > 0
      ? services.map((x) => `${x.descripcion} | ${x.unidad} | ${x.cantidad} | ${x.precio_unitario} | ${x.total}`).join("\n")
      : "No se solicito el servicio";
  const productTypes = (quote.product_types || []).map((x) => ({
    codigo: x.type_code,
    comentario: x.comment || ""
  }));
  const productTypesText = productTypes.map((x) => `${x.comentario}`).join("\n");
  const emittedDate = String(quote.emitted_at || "").slice(0, 10);
  const longDateEs = formatDateEs(emittedDate);
  const location = String(quote.customer?.location || "").trim();
  const cityDateLine = [location, longDateEs].filter(Boolean).join(", ");

  doc.render({
    // Placeholders legacy (already documented)
    quote_number: quote.quote_number,
    emitted_date: emittedDate,
    long_date_es: longDateEs,
    company_name: quote.customer?.company_name || "",
    nit: quote.customer?.nit || "",
    contact: quote.customer?.contact || "",
    project: quote.customer?.project || "",
    location: quote.customer?.location || "",
    phone: quote.customer?.phone || "",
    email: quote.customer?.email || "",
    items_text: itemsText,
    items,
    services_text: servicesText,
    services: servicesForTemplate,
    product_types_text: productTypesText,
    product_types: productTypes,
    // Bloque productos (placeholders legacy):
    subtotal: quote.totals?.products_subtotal || 0,
    subtotal_fmt: formatMoney(quote.totals?.products_subtotal || 0),
    tax_amount: quote.totals?.products_tax_amount || 0,
    tax_amount_fmt: formatMoney(quote.totals?.products_tax_amount || 0),
    total: quote.totals?.products_total || 0,
    total_fmt: formatMoney(quote.totals?.products_total || 0),
    total_in_words: numberToSpanishWords(Number(quote.totals?.products_total || 0)),
    // Placeholders nuevos separados:
    products_subtotal_fmt: formatMoney(quote.totals?.products_subtotal || 0),
    products_tax_amount_fmt: formatMoney(quote.totals?.products_tax_amount || 0),
    products_total_fmt: formatMoney(quote.totals?.products_total || 0),
    services_subtotal_fmt: formatMoney(quote.totals?.services_subtotal || 0),
    services_tax_amount_fmt: formatMoney(quote.totals?.services_tax_amount || 0),
    services_total_fmt: formatMoney(quote.totals?.services_total || 0),
    grand_subtotal_fmt: formatMoney(quote.totals?.grand_subtotal || 0),
    grand_tax_amount_fmt: formatMoney(quote.totals?.grand_tax_amount || 0),
    grand_total_fmt: formatMoney(quote.totals?.grand_total || 0),
    grand_total_in_words: numberToSpanishWords(Number(quote.totals?.grand_total || 0)),
    estimated_delivery_date: quote.estimated_delivery_date || "",
    validity_message: quote.validity?.message || "",
    city_date_line: cityDateLine
  });

  const outputBuffer = doc.getZip().generate({ type: "nodebuffer" });
  cfg.fs.writeFileSync(docxOut, outputBuffer);

  let pdfOut = null;
  let warning = "";
  try {
    pdfOut = await convertDocxToPdf({ docxPath: docxOut, outDir: quoteDir });
  } catch (error) {
    warning = error?.message || "No fue posible convertir a PDF";
  }

  return {
    ok: true,
    quote_number: quote.quote_number,
    docx_path: docxOut,
    pdf_path: pdfOut,
    warning
  };
}

async function convertDocxToPdf({ docxPath, outDir }) {
  const soffice = resolveSofficeBinary();
  const pdfPath = docxPath.replace(/\.docx$/i, ".pdf");
  try {
    if (!soffice) throw new Error("soffice not found");
    await execFileAsync(soffice, ["--headless", "--convert-to", "pdf", "--outdir", outDir, docxPath]);
    return pdfPath;
  } catch {
    if (process.platform === "win32") {
      await convertDocxToPdfWithWordCom({ docxPath, pdfPath });
      return pdfPath;
    }
    throw new Error(
      "No se encontro LibreOffice (soffice). Instala LibreOffice o define LIBREOFFICE_BIN con la ruta de soffice.exe."
    );
  }
}

function resolveSofficeBinary() {
  const envPath = String(process.env.LIBREOFFICE_BIN || "").trim();
  if (envPath) return envPath;

  const candidates = [
    "C:\\Program Files\\LibreOffice\\program\\soffice.exe",
    "C:\\Program Files (x86)\\LibreOffice\\program\\soffice.exe",
    "soffice"
  ];
  for (const candidate of candidates) {
    try {
      if (candidate && process.platform === "win32" && fs.existsSync(candidate)) return candidate;
    } catch {
      // continue
    }
  }
  return "soffice";
}

async function convertDocxToPdfWithWordCom({ docxPath, pdfPath }) {
  const psScript = `
  $ErrorActionPreference = 'Stop'
  $word = New-Object -ComObject Word.Application
  $word.Visible = $false
  $doc = $word.Documents.Open('${escapeForPs(docxPath)}')
  $doc.SaveAs([ref]'${escapeForPs(pdfPath)}', [ref]17)
  $doc.Close()
  $word.Quit()
  `;
  await execFileAsync("powershell.exe", ["-NoProfile", "-NonInteractive", "-Command", psScript]);
}

function escapeForPs(value) {
  return String(value || "").replace(/'/g, "''");
}

function templateHasAnyTag(zip, tagNames) {
  const xmlFiles = zip.file(/word\/(document|header|footer)\d*\.xml/) || [];
  const source = xmlFiles.map((f) => f.asText()).join("\n");
  return tagNames.some((tag) => source.includes(`{${tag}}`));
}

function formatMoney(value) {
  return Number(value || 0).toLocaleString("es-CO");
}

function formatDateEs(yyyyMmDd) {
  const d = new Date(`${yyyyMmDd}T00:00:00`);
  if (Number.isNaN(d.getTime())) return yyyyMmDd;
  return d.toLocaleDateString("es-CO", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });
}

function numberToSpanishWords(value) {
  const n = Math.round(Number(value || 0));
  if (!Number.isFinite(n) || n < 0) return "";
  if (n === 0) return "cero pesos";

  const units = [
    "",
    "uno",
    "dos",
    "tres",
    "cuatro",
    "cinco",
    "seis",
    "siete",
    "ocho",
    "nueve"
  ];
  const teens = [
    "diez",
    "once",
    "doce",
    "trece",
    "catorce",
    "quince",
    "dieciseis",
    "diecisiete",
    "dieciocho",
    "diecinueve"
  ];
  const tens = ["", "", "veinte", "treinta", "cuarenta", "cincuenta", "sesenta", "setenta", "ochenta", "noventa"];
  const hundreds = ["", "ciento", "doscientos", "trescientos", "cuatrocientos", "quinientos", "seiscientos", "setecientos", "ochocientos", "novecientos"];

  function belowHundred(num) {
    if (num < 10) return units[num];
    if (num < 20) return teens[num - 10];
    if (num < 30) return num === 20 ? "veinte" : `veinti${units[num - 20]}`;
    const t = Math.floor(num / 10);
    const u = num % 10;
    return u ? `${tens[t]} y ${units[u]}` : tens[t];
  }

  function belowThousand(num) {
    if (num === 100) return "cien";
    const h = Math.floor(num / 100);
    const rest = num % 100;
    const hText = hundreds[h];
    if (!h) return belowHundred(rest);
    return rest ? `${hText} ${belowHundred(rest)}` : hText;
  }

  function section(num, divisor, singular, plural) {
    const q = Math.floor(num / divisor);
    if (!q) return "";
    if (q === 1) return singular;
    return `${toWords(q)} ${plural}`;
  }

  function toWords(num) {
    if (num < 1000) return belowThousand(num);
    const millions = section(num, 1000000, "un millon", "millones");
    const thousands = section(num % 1000000, 1000, "mil", "mil");
    const hundredsPart = belowThousand(num % 1000);
    return [millions, thousands, hundredsPart].filter(Boolean).join(" ").replace(/\s+/g, " ").trim();
  }

  return `${toWords(n)} pesos`;
}



