# Plan de accion por fases - App de Cotizaciones (Produccion Basica)

## Objetivo
Lanzar una app web simple y productiva que:
- Use Excel para precios de productos
- Use Excel para metodos de pago
- Emita cotizaciones con vigencia del mismo dia
- Calcule entrega estimada a 7 dias habiles

## Fase 0: Alineacion de reglas (2 dias)
Entregables:
- Politicas comerciales aprobadas
- Formato final de ambos Excel
- Texto legal/comercial de vigencia diaria

Definiciones obligatorias:
- Zona horaria oficial del negocio para la vigencia
- Rol autorizado para subir Excels
- Politica para festivos (archivo o manual)

## Fase 1: Diseno UX/UI + membrete (3 dias)
Entregables:
- Flujo de cotizacion (cliente -> items -> pago -> resumen)
- Membrete corporativo final
- Bloque visible de "vigencia solo por el dia de emision"
- Plantilla de salida para web/PDF

## Fase 2: Backend MVP (1 semana)
Entregables:
- Importador Excel de productos/precios
- Importador Excel de metodos de pago
- API de cotizaciones con reglas de vigencia
- Calculo automatico de fecha entrega (7 dias habiles)
- Logs de importacion y errores

Reglas de negocio en backend:
- La vigencia expira a las 23:59 del dia de emision (hora local definida)
- Cotizacion fuera de vigencia requiere revalidacion de precio
- Si un Excel falla, se mantiene ultimo dato valido

## Fase 3: Frontend MVP (1 semana)
Entregables:
- Pantalla de carga de Excels (rol autorizado)
- Formulario de cotizacion basico
- Resumen final con membrete
- Mensaje de vigencia diaria claramente visible
- Visualizacion de fecha estimada (+7 habiles)

## Fase 4: QA y piloto (3 dias)
Entregables:
- Pruebas de cambio de precios por Excel
- Pruebas de cambio de cuentas/metodos de pago por Excel
- Pruebas de expiracion por vigencia diaria
- Pruebas de calculo de 7 dias habiles

## Fase 5: Produccion (go-live) (2 dias)
Entregables:
- Manual operativo corto
- Checklist de soporte y respaldo
- Monitoreo de errores de importacion

## Criterio de exito
- Usuario genera cotizacion en minutos
- Cotizacion refleja precios y pagos del Excel vigente
- Vigencia del dia queda explicita y auditable
- Fecha estimada se calcula automaticamente a 7 dias habiles
