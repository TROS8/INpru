# Fase 2 - Guia de prueba rapida API importacion

## 1) Instalar dependencias
En backend/ ejecutar:
- npm install

## 2) Iniciar servidor
En backend/ ejecutar:
- npm run dev

Servidor esperado:
- http://localhost:3001

## 3) Importar productos (15 seed)
POST /api/import/products
Body JSON de ejemplo:
{
  "uploadedBy": "admin@empresa.com",
  "fileName": "productos_precios_15_seed.csv",
  "csvContent": "<pegar contenido del csv>"
}

## 4) Importar metodos de pago
POST /api/import/payment-methods
Body JSON de ejemplo:
{
  "uploadedBy": "admin@empresa.com",
  "fileName": "metodos_pago_seed.csv",
  "csvContent": "<pegar contenido del csv>"
}

## 5) Ver logs
GET /api/import/logs

## Resultado esperado
- data/products/current_products.json actualizado
- data/payments/current_payment_methods.json actualizado
- data/system/import_logs.json con eventos
