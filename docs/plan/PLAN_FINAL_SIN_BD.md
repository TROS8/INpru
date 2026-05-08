# Plan final por fases - App de cotizaciones SIN BD

## Alcance final
- Sin base de datos.
- Fuente de productos/precios: Excel.
- Fuente de metodos de pago: Excel.
- Cotizacion valida solo el dia de emision.
- Entrega estimada: 7 dias habiles.
- Membrete corporativo obligatorio.

## Stack sugerido (simple y estable)
- Frontend: HTML/CSS/JS o React basico.
- Backend: Node.js + Express.
- Libreria Excel: xlsx.
- Persistencia: archivos JSON/PDF en disco.

Estructura de persistencia sin BD:
- data/products/current_products.json
- data/payments/current_payment_methods.json
- data/quotes/YYYY-MM-DD/QUOTE-xxxx.json
- data/quotes/YYYY-MM-DD/QUOTE-xxxx.pdf (opcional)
- data/system/counter.json
- data/system/import_logs.json

---

## Fase 1: Base del proyecto y reglas del negocio
Objetivo: dejar acordadas y codificadas las reglas centrales.

Tareas:
1. Crear estructura de carpetas de app y data.
2. Definir zona horaria oficial de negocio.
3. Definir formato oficial de Excel de productos.
4. Definir formato oficial de Excel de metodos de pago.
5. Definir texto legal de vigencia diaria.

Entregables:
- Documento de reglas versionado.
- Plantillas Excel oficiales.
- Texto de vigencia aprobado.

Checklist de cierre:
- Regla de vigencia diaria clara.
- Regla de recalculo fuera de vigencia clara.
- Regla de +7 dias habiles clara.

---

## Fase 2: Importador de Excel (productos + pagos)
Objetivo: cargar Excel y convertirlo en JSON valido para el sistema.

Tareas:
1. Endpoint para subir Excel de productos.
2. Validar columnas y tipos de datos.
3. Rechazar duplicados por codigo.
4. Guardar current_products.json si validacion pasa.
5. Endpoint para subir Excel de metodos de pago.
6. Validar al menos 1 metodo activo.
7. Guardar current_payment_methods.json si validacion pasa.
8. Registrar import_logs.json con fecha, usuario y resultado.

Entregables:
- API de importacion funcional.
- Reporte de errores por fila.

Checklist de cierre:
- Si falla importacion, no pisa archivo vigente.
- Queda log de quien subio y que cambio.

---

## Fase 3: API de cotizaciones sin BD
Objetivo: crear cotizaciones y guardarlas en archivos.

Tareas:
1. Endpoint crear cotizacion.
2. Leer precios desde current_products.json.
3. Leer metodos desde current_payment_methods.json.
4. Validar items y caracteristicas obligatorias.
5. Calcular subtotal/impuestos/total.
6. Calcular fecha estimada (+7 habiles).
7. Asignar numero consecutivo (counter.json).
8. Guardar cotizacion JSON por fecha.

Entregables:
- Cotizacion persistida en archivo.
- API para consultar cotizacion por numero.

Checklist de cierre:
- Numero de cotizacion unico.
- Precio congelado al emitir.
- Vigencia guardada (inicio/fin del dia).

---

## Fase 4: Frontend MVP + membrete
Objetivo: flujo usable de punta a punta.

Tareas:
1. Vista de carga de Excels (rol autorizado).
2. Formulario cliente + productos.
3. Campo de comentario por producto.
4. Selector de metodo de pago desde JSON vigente.
5. Render de resumen con membrete.
6. Mostrar texto de vigencia diaria de forma visible.
7. Mostrar fecha estimada de entrega.

Entregables:
- Flujo completo para emitir cotizacion.
- Vista imprimible/exportable.

Checklist de cierre:
- No se emite cotizacion con datos incompletos.
- Membrete y vigencia visibles en resultado final.

---

## Fase 5: Documento final (PDF) y trazabilidad
Objetivo: salida comercial lista para cliente.

Tareas:
1. Generar PDF desde cotizacion emitida.
2. Incluir membrete, items, totales y pago.
3. Incluir texto legal de vigencia diaria.
4. Guardar PDF junto al JSON.
5. Registrar hash o checksum simple del archivo (opcional).

Entregables:
- PDF comercial por cotizacion.

Checklist de cierre:
- PDF coincide con JSON emitido.
- Nombre de archivo estandarizado.

---

## Fase 6: QA funcional y pruebas de riesgo
Objetivo: minimizar fallos antes de produccion.

Casos minimos:
1. Cambio de precio en Excel antes de nueva cotizacion.
2. Cambio de cuenta bancaria en Excel.
3. Intento de cotizar con producto inexistente.
4. Error de tipo de dato en Excel.
5. Vigencia vencida al dia siguiente.
6. Calculo correcto de +7 habiles.
7. Emision concurrente de 2 cotizaciones (control de consecutivo).

Entregables:
- Matriz de pruebas ejecutada.
- Lista de correcciones aplicadas.

Checklist de cierre:
- Sin errores bloqueantes.
- Reglas comerciales cumplidas.

---

## Fase 7: Produccion basica y operacion
Objetivo: salir a uso real controlado.

Tareas:
1. Configurar despliegue (VPS/hosting interno).
2. Configurar backups diarios de carpeta data/.
3. Definir responsables de carga Excel.
4. Crear manual operativo de 1 pagina.
5. Definir protocolo de contingencia (restaurar ultimo JSON valido).

Entregables:
- App en produccion.
- Procedimiento de soporte basico.

Checklist de cierre:
- Backup probado.
- Recuperacion probada.
- Operacion cotidiana documentada.

---

## Politicas de negocio finales (resumen)
- Cotizacion valida solo el dia de emision.
- Si cliente paga despues, empresa puede actualizar precio.
- Fecha estimada: 7 dias habiles desde emision.
- Datos de pago y precios salen del Excel vigente al emitir.

## Limites del enfoque sin BD
- Menor concurrencia.
- Auditoria limitada.
- Escalabilidad limitada.

## Mitigaciones minimas
- Bloqueo de escritura para consecutivo.
- Backups diarios.
- Logs de importacion y emision.
