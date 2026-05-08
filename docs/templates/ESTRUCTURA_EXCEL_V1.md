# Estructura recomendada de Excels

## Archivo 1: productos_precios.xlsx
Hoja: products
Columnas minimas:
- product_code
- product_name
- unit_price
- currency
- active
- updated_at

Reglas:
- product_code unico
- unit_price > 0
- currency obligatoria

## Archivo 2: metodos_pago.xlsx
Hoja: payment_methods
Columnas minimas:
- payment_code
- payment_name
- account_number
- account_type
- bank_name
- owner_name
- owner_id
- instructions
- active
- updated_at

Reglas:
- payment_code unico
- al menos 1 metodo activo
- account_number obligatorio cuando aplique

## Nota operativa
Cualquier cambio en numeros de cuenta o instrucciones se hace en Excel y se refleja tras importacion valida.
