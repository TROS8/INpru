# Guía para adaptar TU formato Word y exportar PDF

Plantilla activa:
- backend/templates/plantilla_cotizacion.docx

## 1) Qué ya se analizó del formato
El documento incluye:
- Membrete en encabezado (logos)
- Bloque de destinatario (empresa, contacto, proyecto, ciudad, teléfono, correo)
- Párrafos predeterminados de propuesta
- Sección A con tabla de productos
- Totales (subtotal, IVA, total)
- Sección B de servicios opcionales

## 2) Placeholders recomendados para tu plantilla
Inserta estos tags donde corresponda:

Encabezado de datos:
- {{long_date_es}}
- {{company_name}}
- {{nit}}
- {{contact}}
- {{project}}
- {{location}}
- {{phone}}
- {{email}}
- {{quote_number}}

Totales:
- {{subtotal_fmt}}
- {{tax_amount_fmt}}
- {{total_fmt}}
- {{estimated_delivery_date}}
- {{validity_message}}

## 3) Tabla Sección A (recomendado con loop)
En la fila de ejemplo de la tabla, usa estos tags en columnas:
- DESCRIPCIÓN: {descripcion}
- DIÁMETRO: {diametro}
- CANTIDAD: {cantidad}
- P. UNITARIO($): {precio_unitario}
- TOTAL($): {total}

Para que se repita por cada ítem, envuelve la fila con loop:
- Inicio de fila: {#items}
- Fin de fila: {/items}

Nota: el loop debe quedar en la misma fila de la tabla que vas a repetir.

## 4) Alternativa simple (sin loop de tabla)
Si quieres avanzar rápido, usa:
- {{items_text}}

Esto imprime los ítems en texto corrido (no en filas de tabla).

## 5) Exportación a PDF
Endpoint:
- POST /api/quotes/:quoteNumber/export-pdf

Salida esperada:
- data/quotes/YYYY-MM-DD/QUOTE-XXXX.docx
- data/quotes/YYYY-MM-DD/QUOTE-XXXX.pdf

## 6) Requisito para PDF
LibreOffice instalado y ejecutable `soffice` disponible.
Opcional variable de entorno:
- LIBREOFFICE_BIN="C:\\Program Files\\LibreOffice\\program\\soffice.exe"
