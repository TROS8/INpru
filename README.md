# Proyecto App de Cotizaciones

Implementacion orientada a produccion basica sin base de datos, usando Excel como fuente operativa.

## Estado actual
- Fase 1 completada.
- Fase 2 completada.
- Fase 3 completada.
- Fase 4 completada.

## Uso rapido
1. En `backend/`: `npm install` y `npm run dev`
2. Abrir `http://localhost:3001`
3. Importar CSV de productos y metodos de pago
4. Emitir cotizacion desde el formulario web

## API disponible
- GET /health
- POST /api/import/products
- POST /api/import/payment-methods
- GET /api/import/logs
- GET /api/catalog/products
- GET /api/catalog/payment-methods
- POST /api/quotes
- GET /api/quotes/:quoteNumber

## GUIAS
- docs/phase-deliverables/FASE_2_GUIA_PRUEBA.md
- docs/phase-deliverables/FASE_3_GUIA_PRUEBA.md
- docs/phase-deliverables/FASE_4_GUIA_PRUEBA.md

## Estructura recomendada
- `backend/`: API y logica de negocio activa (`src/server.js`).
- `frontend/`: interfaz web activa (`index.html`, `app.js`, `styles/`).
- `data/`: archivos operativos (productos, servicios, cotizaciones, logs).
- `config/`: reglas de negocio y configuraciones globales.
- `docs/`: documentacion funcional y tecnica.
- `workspace/`: area de trabajo auxiliar no productiva:
- `workspace/docx-lab/`: inspecciones y pruebas de DOCX.
- `workspace/test-assets/`: archivos de prueba.
- `workspace/backups/`: respaldos `.bak` de plantilla.
