# Politicas comerciales v1 (para produccion basica)

## 1) Fuente de datos por Excel
La aplicacion consumira dos archivos Excel:
- Excel de productos y precios
- Excel de metodos de pago

Objetivo:
Permitir cambios operativos sin despliegues tecnicos.

## 2) Vigencia de cotizacion
- La cotizacion es valida unicamente el dia en que fue emitida.
- La fecha usada para validez es la fecha local de emision de la cotizacion.
- Si el cliente paga en fecha posterior, la empresa puede recalcular o rechazar el precio anterior.

Texto sugerido en la cotizacion:
"Cotizacion valida unicamente para el dia de emision. Cambios de precio posteriores pueden aplicar sin previo aviso."

## 3) Precio aplicado
- El precio que muestra la cotizacion se toma del Excel vigente al momento de emitir.
- Para cotizaciones no pagadas fuera de vigencia, la empresa valida nuevamente contra el ultimo Excel.

## 4) Fecha estimada de entrega
- Se calcula automaticamente a 7 dias habiles desde la fecha de emision.
- No cuenta sabados, domingos ni festivos (si se carga calendario de festivos).
- Si no existe calendario de festivos, solo se excluyen sabados y domingos.

## 5) Responsabilidad y trazabilidad
- Guardar fecha/hora de emision de cada cotizacion.
- Guardar version o marca de tiempo del Excel usado al emitir.
- Guardar usuario que emitio la cotizacion.

## 6) Reglas de produccion minima
- Si falla la carga de Excel, se conserva el ultimo dato valido.
- Solo roles autorizados pueden cargar Excel.
- Registrar log de importacion con errores y filas rechazadas.
