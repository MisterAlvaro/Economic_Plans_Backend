# Variables de entorno para Vercel (solo Supabase)

Para desplegar el API y que consuma **solo** la base de datos de Supabase (Postgres), configura en **Vercel → Settings → Environment Variables**:

| Variable | Valor | Notas |
|----------|--------|--------|
| `NODE_ENV` | `production` | Para cookies `secure` en HTTPS |
| `DB_HOST` | *(ver abajo)* | **Usar Connection pooler** (no conexión directa) |
| `DB_PORT` | `6543` | Pooler. Directo sería 5432 |
| `DB_USERNAME` | `postgres.irkduuzaxceaarjsckif` | Con punto + project ref (pooler) |
| `DB_PASSWORD` | *(tu contraseña)* | Supabase → Settings → Database |
| `DB_DATABASE` | `postgres` | |
| `DB_SYNCHRONIZE` | `false` | No tocar el esquema en producción |
| `JWT_SECRET` | *(un secreto largo y aleatorio)* | Para login/refresh tokens |

## DB_HOST: usar Connection pooler (importante en Vercel)

Si ves **ENOTFOUND** o errores de conexión, en serverless hay que usar el **pooler** de Supabase, no la conexión directa:

1. Entra en **Supabase Dashboard** → tu proyecto → **Settings** → **Database**.
2. En **Connection string** elige **URI** o **Connection pooling**.
3. Copia el **host** (ej. `aws-0-us-east-1.pooler.supabase.com`) y ponlo en `DB_HOST`.
4. Puerto `6543`, usuario `postgres.irkduuzaxceaarjsckif` (postgres + punto + ref del proyecto).

La conexión directa (`db.xxx.supabase.co:5432`) a veces no resuelve DNS desde Vercel; el pooler suele funcionar.

---

**Vercel Dashboard:** Si aparece *"No exports found in module src/index.js"*, en el proyecto → **Settings** → **General** → **Framework Preset** pon **Other** (no Node.js) para que solo se use la carpeta `api/`.
