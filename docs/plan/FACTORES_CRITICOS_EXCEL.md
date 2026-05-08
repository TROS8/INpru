# Factores criticos para esta app (Excel como fuente de precios)

## 1) Gobernanza del Excel
- Definir un unico responsable de edicion.
- Congelar nombres de columnas para no romper el parser.
- Mantener una sola hoja oficial de precios.

## 2) Estructura minima recomendada del Excel
Columnas sugeridas:
- product_code (unico)
- product_name
- base_price
- currency
- updated_at
- active

## 3) Validaciones obligatorias al importar
- Codigo de producto no vacio.
- Precio numerico mayor a 0.
- No duplicados de product_code.
- Moneda permitida por negocio.

## 4) Trazabilidad y auditoria
- Guardar quien subio el Excel.
- Guardar fecha/hora de importacion.
- Guardar resumen de cambios de precio.

## 5) Estrategia cuando falle el Excel
- No sobrescribir precios vigentes si hay error.
- Mostrar reporte de errores por fila.
- Permitir reintento con archivo corregido.

## 6) Impacto en cotizaciones existentes
- Definir politica:
  - Opcion A: cotizacion usa precio congelado al momento de creacion.
  - Opcion B: cotizacion en borrador se recalcula con ultimo Excel.
- Recomendacion: A para enviadas, B para borradores.

## 7) Seguridad y acceso
- Subida de Excel solo para rol autorizado.
- Registro de cambios de metodos de pago y entrega.

## 8) Membrete y salida comercial
- Plantilla consistente para web/PDF.
- Version de membrete controlada por diseno.

## 9) Escalabilidad realista
- Con 15 productos, arquitectura simple es suficiente.
- Mantener modular para crecer a catalogo mayor.

## 10) Continuidad operativa
- Respaldo diario del Excel.
- Versionado por nombre con fecha (ejemplo: precios_2026-05-06.xlsx).
