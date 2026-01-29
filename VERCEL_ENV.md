# Variables de entorno para Vercel (solo Supabase)

Para desplegar el API y que consuma **solo** la base de datos de Supabase (Postgres), necesitas **solo estas 8** en Vercel → Settings → Environment Variables:

| Variable | Valor | Notas |
|----------|--------|--------|
| `NODE_ENV` | `production` | Para cookies `secure` en HTTPS |
| `DB_HOST` | `db.irkduuzaxceaarjsckif.supabase.co` | Host Postgres de Supabase |
| `DB_PORT` | `5432` | Directo. Si usas pooler: `6543` |
| `DB_USERNAME` | `postgres` | |
| `DB_PASSWORD` | *(tu contraseña)* | Supabase → Settings → Database |
| `DB_DATABASE` | `postgres` | |
| `DB_SYNCHRONIZE` | `false` | No tocar el esquema en producción |
| `JWT_SECRET` | *(un secreto largo y aleatorio)* | Para login/refresh tokens |

`PORT` la define Vercel; el backend ya la usa. No hace falta `CORS_*`, `FRONTEND_URL`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` ni el resto para que el API funcione solo con Supabase.
