# Arquitectura inicial sugerida (Excel-first)

## Enfoque
Aplicacion web de cotizaciones para un catalogo pequeno (15 productos), donde el precio vigente se administra desde Excel.

## Modulos funcionales
- Quotes: ciclo de vida de cotizacion
- Products: catalogo interno sincronizado desde Excel
- Excel Import: carga, validacion y aplicacion de precios
- Comments: observaciones por producto cotizado
- Payments: metodos y condiciones de pago
- Delivery: fecha prevista de entrega
- Branding: membrete y plantilla de cotizacion

## Flujo base
1. Administrador carga Excel de precios
2. Sistema valida y actualiza precios
3. Usuario crea cotizacion por cliente
4. Agrega productos y cantidades
5. Completa caracteristicas y comentario opcional por item
6. Define metodo de pago y fecha prevista
7. Genera resumen final con membrete

## Persistencia recomendada
Aunque precios vengan de Excel, se recomienda base de datos para:
- clientes
- cotizaciones
- items cotizados
- comentarios
- metodos de pago
- historial de importaciones de Excel

## Reglas clave
- Excel invalido no reemplaza precios vigentes
- Cotizaciones enviadas conservan precio historico
- Cotizaciones en borrador pueden recalcularse con precio actualizado
- Ninguna cotizacion se envia sin metodo de pago y fecha prevista
