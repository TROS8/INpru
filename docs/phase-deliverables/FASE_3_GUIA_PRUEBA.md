# Fase 3 - Guia de prueba API cotizaciones

## Requisito previo
Antes de crear cotizaciones, debe existir data vigente:
- Productos importados en data/products/current_products.json
- Metodos de pago importados en data/payments/current_payment_methods.json

## Endpoint 1: Crear cotizacion
POST /api/quotes

Body de ejemplo:
{
  "createdBy": "asesor@empresa.com",
  "customer": {
    "name": "Carlos Ramirez",
    "email": "carlos@email.com",
    "phone": "3001234567",
    "document_id": "1020304050"
  },
  "items": [
    {
      "product_code": "P001",
      "quantity": 2,
      "requirements": {
        "color": "Negro",
        "potencia": "450W"
      },
      "comment": "Instalacion en terraza"
    },
    {
      "product_code": "P003",
      "quantity": 1,
      "requirements": {
        "voltaje": "220V"
      },
      "comment": ""
    }
  ],
  "paymentMethodCode": "TRF01",
  "taxRate": 19
}

Respuesta esperada:
- quote_number (ej: QUOTE-0001)
- quote_path
- quote completo en JSON

## Endpoint 2: Consultar cotizacion
GET /api/quotes/QUOTE-0001

Respuesta esperada:
- Cotizacion guardada por numero

## Reglas validadas por API
- Producto debe existir y estar activo
- Metodo de pago debe existir y estar activo
- Cantidad > 0
- requirements obligatorio por item
- Precio congelado al emitir
- Vigencia solo dia de emision
- Fecha estimada = +7 dias habiles
