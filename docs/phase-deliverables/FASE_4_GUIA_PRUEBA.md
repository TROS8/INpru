# Fase 4 - Guia de prueba frontend MVP

## 1) Levantar backend
En `backend/` ejecutar:
- npm install
- npm run dev

## 2) Abrir app web
Ir a:
- http://localhost:3001

## 3) Probar carga de CSV
- Cargar `docs/templates/productos_precios_15_seed.csv`
- Cargar `docs/templates/metodos_pago_seed.csv`
- Confirmar respuesta `ok: true` en cada importacion

## 4) Probar emision de cotizacion
- Completar datos cliente
- Agregar uno o mas items
- Seleccionar metodo de pago
- Click en `Emitir cotizacion`

## 5) Validar salida
- Se muestra resumen con membrete
- Se muestra texto de vigencia diaria
- Se muestra fecha estimada de entrega (+7 habiles)
- Se guarda archivo en `data/quotes/YYYY-MM-DD/QUOTE-xxxx.json`
