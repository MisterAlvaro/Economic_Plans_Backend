# Economic Plans Backend

API REST para la gestión de planes económicos, divisiones, usuarios y hojas de cálculo con fórmulas.

---

## Arquitectura del sistema

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           CLIENTE (Frontend)                             │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │ HTTP/REST
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                     CAPA DE PRESENTACIÓN (API)                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────────────┐│
│  │   Express    │  │   CORS       │  │  Rutas: /api/plans, /api/auth...  ││
│  │   (app.ts)   │  │   Cookies    │  │  Middleware: JWT, Excel validator ││
│  └──────────────┘  └──────────────┘  └──────────────────────────────────┘│
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                     CAPA DE LÓGICA (Controllers)                         │
│  AuthController │ UserController │ PlanController │ FormulaCellController │
│  DivisionController │ EconomicIndicatorController │ PlanSheetController   │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                     CAPA DE SERVICIOS                                    │
│  ExcelProcessor │ FormulaCalculator │ InitializationService               │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                     CAPA DE DATOS (TypeORM)                              │
│  Entities: User, Division, EconomicPlan, PlanSheet, FormulaCell...       │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                     BASE DE DATOS (PostgreSQL / Supabase)                 │
└─────────────────────────────────────────────────────────────────────────┘
```

### Entornos de ejecución

| Entorno        | Descripción                                                                 |
|----------------|-----------------------------------------------------------------------------|
| **Local**      | `src/index.ts` → inicializa DB, escucha en `PORT` (p. ej. 3001)             |
| **Vercel**     | `api/index.js` → handler serverless con `serverless-http`, sin listen       |

---

## Tecnologías utilizadas

| Tecnología       | Versión  | Uso                                            |
|------------------|----------|------------------------------------------------|
| **Node.js**      | ≥18      | Runtime                                        |
| **TypeScript**   | ^5.8.3   | Lenguaje                                       |
| **Express**      | ^5.1.0   | Framework web                                  |
| **TypeORM**      | ^0.3.25  | ORM / acceso a datos                           |
| **PostgreSQL**   | -        | Base de datos (Supabase)                       |
| **pg**           | ^8.16.3  | Driver PostgreSQL                              |
| **bcrypt**       | ^6.0.0   | Hash de contraseñas                            |
| **jsonwebtoken** | ^9.0.2   | Tokens JWT                                     |
| **multer**       | ^2.0.2   | Subida de archivos (Excel)                     |
| **xlsx**         | ^0.18.5  | Lectura/escritura Excel                        |
| **formula-parser** | ^2.0.1 | Evaluación de fórmulas                         |
| **formulajs**    | ^1.0.8   | Funciones Excel (SUM, IF, etc.)                |
| **cors**         | ^2.8.5   | CORS                                           |
| **dotenv**       | ^17.2.1  | Variables de entorno                           |
| **serverless-http** | ^3.2.0 | Adaptador Express → Vercel serverless          |
| **reflect-metadata** | ^0.2.2 | Decoradores TypeORM                            |

---

## Estructura del proyecto

```
economic-plans-backend/
├── api/
│   └── index.js              # Handler serverless (Vercel)
├── src/
│   ├── app.ts                # App Express (rutas, middlewares)
│   ├── index.ts              # Punto de entrada local
│   ├── data-source.ts        # Configuración TypeORM
│   ├── data-source-cli.ts    # DataSource para CLI migrations
│   ├── routes.ts             # Definición de rutas
│   ├── controller/           # Controladores
│   ├── entity/               # Entidades TypeORM
│   ├── middleware/           # authMiddleware, excelValidator
│   ├── services/             # ExcelProcessor, FormulaCalculator, InitializationService
│   ├── migration/            # Migraciones TypeORM
│   ├── seed/                 # Seeds
│   └── fullMigration.ts      # Script de migración a Supabase
├── vercel.json               # Configuración Vercel
├── ormconfig.json            # Config ORM (CLI)
├── tsconfig.json
└── package.json
```

---

## Variables de entorno

Crea un archivo `.env` en la raíz del proyecto:

| Variable          | Ejemplo                             | Descripción                    |
|-------------------|-------------------------------------|--------------------------------|
| `DB_HOST`         | `aws-0-us-east-1.pooler.supabase.com` | Host PostgreSQL (pooler Supabase) |
| `DB_PORT`         | `6543`                              | Puerto (pooler: 6543, directo: 5432) |
| `DB_USERNAME`     | `postgres.xxxxx`                    | Usuario (con punto + ref proyecto) |
| `DB_PASSWORD`     | `***`                               | Contraseña BD                  |
| `DB_DATABASE`     | `postgres`                          | Nombre de la BD                |
| `DB_SYNCHRONIZE`  | `false`                             | No modificar esquema en prod   |
| `JWT_SECRET`      | `secret-largo-aleatorio`            | Secreto para JWT               |
| `PORT`            | `3001`                              | Puerto local (opcional)        |

Para despliegue en Vercel, ver `VERCEL_ENV.md`.

---

## Instrucciones de uso

### 1. Instalación

```bash
# Clonar el repositorio
git clone <url-repo>
cd economic-plans-backend

# Instalar dependencias
npm install

# Crear .env con las variables (ver tabla anterior)
```

### 2. Desarrollo local

```bash
# Modo desarrollo (con hot-reload)
npm run dev

# La API estará en http://localhost:3001
# Health check: GET http://localhost:3001/
```

### 3. Build y producción local

```bash
# Compilar TypeScript
npm run build

# Ejecutar versión compilada
npm start
```

### 4. Despliegue en Vercel

1. Conectar el repositorio a Vercel.
2. Configurar las variables de entorno en **Settings → Environment Variables** (ver `VERCEL_ENV.md`).
3. **Framework Preset**: Other.
4. El build usa `npm run build`; el handler está en `api/index.js`.

---

## API – Endpoints principales

**Base URL local:** `http://localhost:3001/api`  
**Base URL Vercel:** `https://<tu-proyecto>.vercel.app/api`

### Públicos (sin autenticación)

| Método | Ruta           | Descripción              |
|--------|----------------|--------------------------|
| GET    | `/`            | Health check             |
| POST   | `/api/users`   | Registro de usuario      |
| POST   | `/api/auth/login`  | Login (email, password)  |
| POST   | `/api/auth/refresh`| Refresh token            |
| POST   | `/api/auth/logout` | Cerrar sesión            |

### Protegidos (Header: `Authorization: Bearer <token>`)

| Método | Ruta                               | Descripción                |
|--------|------------------------------------|----------------------------|
| GET    | `/api/plans`                       | Listar planes              |
| GET    | `/api/plans/:id`                   | Obtener plan               |
| POST   | `/api/plans`                       | Crear plan                 |
| POST   | `/api/plans/:id/upload`            | Subir Excel                |
| PUT    | `/api/plans/:id/status`            | Actualizar estado          |
| DELETE | `/api/plans/:id`                   | Eliminar plan              |
| GET    | `/api/users`                      | Listar usuarios            |
| GET    | `/api/divisions`                  | Listar divisiones          |
| GET    | `/api/plans/:planId/sheets`       | Hojas de un plan           |
| GET    | `/api/sheets/:sheetId/formula-cells` | Celdas con fórmulas     |
| GET    | `/api/indicators`                 | Indicadores económicos     |

---

## Scripts disponibles

| Comando             | Descripción                          |
|---------------------|--------------------------------------|
| `npm run dev`       | Desarrollo con nodemon               |
| `npm run build`     | Compilar TypeScript                  |
| `npm start`         | Ejecutar versión compilada           |
| `npm run migration:run`   | Ejecutar migraciones           |
| `npm run migration:revert`| Revertir última migración      |
| `npm run full:migration` | Migración completa a Supabase  |

---

## Ejemplo: Registro y login

**Registrar usuario:**

```http
POST /api/users
Content-Type: application/json

{
  "email": "usuario@ejemplo.com",
  "fullName": "Nombre Apellido",
  "password": "contraseña_segura",
  "divisionId": 1,
  "role": "economist"
}
```

**Login:**

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "usuario@ejemplo.com",
  "password": "contraseña_segura"
}
```

Respuesta: `{ refreshToken, user }` y cookie `token` (JWT).

---

## Licencia

ISC
