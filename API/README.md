# Comercio Internacional API

REST API para la aplicación de comercio internacional de Porroa e Hijos.

## Características

- **REST API** completa siguiendo principios RESTful
- **Express.js** con middleware de seguridad
- **Endpoints** especializados para comercio internacional
- **Documentación** automática de endpoints
- **Datos** simulados realistas para demostración

## Endpoints Principales

### Mercados (`/api/v1/markets`)
- `GET /api/v1/markets` - Obtener todos los mercados
- `GET /api/v1/markets/:id` - Obtener mercado específico
- `GET /api/v1/markets/:id/trends` - Obtener tendencias de mercado

### Proveedores (`/api/v1/suppliers`)
- `GET /api/v1/suppliers` - Obtener proveedores con filtros
- `GET /api/v1/suppliers/:id` - Obtener proveedor específico
- `GET /api/v1/suppliers/:id/validate` - Validar calidad del proveedor
- `GET /api/v1/suppliers/categories` - Obtener categorías disponibles

### Conversión de Moneda (`/api/v1/currency`)
- `GET /api/v1/currency/rates` - Obtener tasas de cambio
- `GET /api/v1/currency/rates/:from/:to` - Tasa entre dos monedas
- `POST /api/v1/currency/convert` - Convertir cantidad
- `POST /api/v1/currency/convert/batch` - Conversión en lote
- `GET /api/v1/currency/currencies` - Monedas disponibles

### Aranceles (`/api/v1/tariff`)
- `GET /api/v1/tariff/rates` - Obtener todas las tasas arancelarias
- `GET /api/v1/tariff/rates/:country/:category` - Tasa específica
- `POST /api/v1/tariff/calculate` - Calcular arancel
- `POST /api/v1/tariff/compare` - Comparar aranceles entre países
- `GET /api/v1/tariff/categories` - Categorías de productos

### Comercio (`/api/v1/trade`)
- `GET /api/v1/trade/analytics` - Análisis de comercio
- `GET /api/v1/trade/opportunities` - Oportunidades comerciales
- `POST /api/v1/trade/quote` - Generar cotización
- `GET /api/v1/trade/routes` - Rutas comerciales

## Instalación

```bash
cd API
npm install
```

## Configuración

1. Copiar archivo de configuración:
```bash
cp .env.example .env
```

2. Editar `.env` con tus configuraciones

## Ejecutar

### Desarrollo
```bash
npm run dev
```

### Producción
```bash
npm start
```

El servidor estará disponible en `http://localhost:3000`

## Documentación

- **Health Check**: `GET /health`
- **API Info**: `GET /api/v1`
- **Documentación completa**: Disponible en el endpoint raíz

## Ejemplos de Uso

### Obtener mercados
```bash
curl http://localhost:3000/api/v1/markets
```

### Convertir moneda
```bash
curl -X POST http://localhost:3000/api/v1/currency/convert \
  -H "Content-Type: application/json" \
  -d '{"amount": 100, "from": "USD", "to": "EUR"}'
```

### Calcular arancel
```bash
curl -X POST http://localhost:3000/api/v1/tariff/calculate \
  -H "Content-Type: application/json" \
  -d '{"productValue": 10000, "country": "US", "productCategory": "electronics"}'
```

### Generar cotización
```bash
curl -X POST http://localhost:3000/api/v1/trade/quote \
  -H "Content-Type: application/json" \
  -d '{
    "product": "Laptop computers",
    "quantity": 100,
    "sourceCountry": "CN",
    "destinationCountry": "US",
    "category": "electronics",
    "unitPrice": 800
  }'
```

## Estructura del Proyecto

```
API/
├── server.js              # Servidor principal
├── package.json           # Dependencias y scripts
├── .env.example          # Configuración de ejemplo
├── routes/               # Rutas de la API
│   ├── markets.js        # Endpoints de mercados
│   ├── suppliers.js      # Endpoints de proveedores
│   ├── currency.js       # Endpoints de moneda
│   ├── tariff.js         # Endpoints de aranceles
│   └── trade.js          # Endpoints de comercio
└── data/                 # Datos de ejemplo
    ├── markets.json      # Datos de mercados
    └── suppliers.json    # Datos de proveedores
```

## Principios REST

La API sigue los principios REST:

- **Recursos**: Cada endpoint representa un recurso específico
- **Métodos HTTP**: GET (leer), POST (crear/procesar), PUT (actualizar), DELETE (eliminar)
- **Códigos de estado**: Uso correcto de códigos HTTP (200, 201, 400, 404, 500)
- **Respuestas JSON**: Formato consistente de respuestas
- **Stateless**: Cada petición es independiente

## Formato de Respuesta

Todas las respuestas siguen el formato:

```json
{
  "success": true,
  "data": { ... },
  "message": "Optional message",
  "pagination": { ... }, // Para listas
  "error": "Error message" // Solo en errores
}
```

## Seguridad

- **Helmet**: Protección de headers HTTP
- **CORS**: Configuración de origen cruzado
- **Rate Limiting**: Limitación de peticiones (configurado en .env)
- **Validación**: Validación de entrada en todos los endpoints

## Tecnologías

- **Node.js**: Runtime de JavaScript
- **Express.js**: Framework web
- **ES6 Modules**: Sintaxis moderna de módulos
- **JSON**: Formato de datos
- **dotenv**: Gestión de variables de entorno