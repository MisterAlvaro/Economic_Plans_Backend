BEGIN;

-- Eliminar TODAS las tablas del schema public (incluye tablas creadas por error)
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
  LOOP
    EXECUTE format('DROP TABLE IF EXISTS public.%I CASCADE', r.tablename);
  END LOOP;
END $$;

-- 1) Divisiones
CREATE TABLE divisions (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  code VARCHAR(10) UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2) Usuarios
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  division_id INTEGER REFERENCES divisions(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'economist')),
  is_active BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3) Plan Maestro anual (admin)
CREATE TABLE master_plans (
  id SERIAL PRIMARY KEY,
  year INTEGER UNIQUE NOT NULL CHECK (year BETWEEN 2000 AND 2100),
  status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active')),
  file_name VARCHAR(255),
  created_by INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE
);

-- 4) Planes Económicos por división
CREATE TABLE economic_plans (
  id SERIAL PRIMARY KEY,
  division_id INTEGER NOT NULL REFERENCES divisions(id) ON DELETE CASCADE,
  master_plan_id INTEGER NOT NULL REFERENCES master_plans(id) ON DELETE RESTRICT,
  year INTEGER NOT NULL CHECK (year BETWEEN 2000 AND 2100),
  version INTEGER DEFAULT 1,
  status VARCHAR(20) CHECK (status IN ('draft', 'reviewed', 'approved')),
  created_by INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reviewed_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  approved_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE,
  UNIQUE (division_id, year)
);

-- 5) Hojas del plan maestro
CREATE TABLE master_plan_sheets (
  id SERIAL PRIMARY KEY,
  master_plan_id INTEGER NOT NULL REFERENCES master_plans(id) ON DELETE CASCADE,
  sheet_name VARCHAR(50) NOT NULL,
  data JSONB NOT NULL,
  UNIQUE (master_plan_id, sheet_name)
);

-- 6) Hojas de planes divisionales
CREATE TABLE plan_sheets (
  id SERIAL PRIMARY KEY,
  plan_id INTEGER NOT NULL REFERENCES economic_plans(id) ON DELETE CASCADE,
  sheet_name VARCHAR(50) NOT NULL,
  data JSONB NOT NULL,
  UNIQUE (plan_id, sheet_name)
);

-- 7) Celdas con fórmulas
CREATE TABLE formula_cells (
  id SERIAL PRIMARY KEY,
  sheet_id INTEGER NOT NULL REFERENCES plan_sheets(id) ON DELETE CASCADE,
  cell_reference VARCHAR(10) NOT NULL,
  formula TEXT NOT NULL,
  depends_on TEXT[],
  last_value NUMERIC(15, 2),
  last_calculated_at TIMESTAMP WITH TIME ZONE
);

-- 8) Historial de recomendaciones IA para reajustes
CREATE TABLE ai_reajuste_history (
  id SERIAL PRIMARY KEY,
  plan_id INTEGER NOT NULL REFERENCES economic_plans(id) ON DELETE CASCADE,
  requested_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  model_name VARCHAR(80) NOT NULL,
  context JSONB,
  recommendation TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9) Auditoría
CREATE TABLE plan_audit_log (
  id SERIAL PRIMARY KEY,
  plan_id INTEGER NOT NULL REFERENCES economic_plans(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action VARCHAR(20) NOT NULL CHECK (action IN ('create', 'update', 'review', 'approve')),
  changed_table VARCHAR(30),
  changed_field VARCHAR(50),
  old_value TEXT,
  new_value TEXT,
  ip_address VARCHAR(45),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10) Indicadores
CREATE TABLE economic_indicators (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(30) UNIQUE NOT NULL,
  unit VARCHAR(10),
  description TEXT,
  formula_template TEXT
);

-- 11) Tokens revocados (para logout / blacklist)
CREATE TABLE revoked_tokens (
  id SERIAL PRIMARY KEY,
  token TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Índices
CREATE INDEX idx_users_division ON users(division_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_economic_plans_division ON economic_plans(division_id);
CREATE INDEX idx_economic_plans_master_plan ON economic_plans(master_plan_id);
CREATE INDEX idx_economic_plans_year ON economic_plans(year);
CREATE INDEX idx_economic_plans_created_by ON economic_plans(created_by);
CREATE INDEX idx_master_plans_year ON master_plans(year);
CREATE INDEX idx_master_plan_sheets_plan ON master_plan_sheets(master_plan_id);
CREATE INDEX idx_plan_sheets_plan ON plan_sheets(plan_id);
CREATE INDEX idx_formula_cells_sheet ON formula_cells(sheet_id);
CREATE INDEX idx_ai_reajuste_history_plan ON ai_reajuste_history(plan_id);
CREATE INDEX idx_plan_audit_log_plan ON plan_audit_log(plan_id);
CREATE INDEX idx_plan_audit_log_user ON plan_audit_log(user_id);
CREATE INDEX idx_economic_indicators_code ON economic_indicators(code);
CREATE INDEX idx_revoked_tokens_expires_at ON revoked_tokens(expires_at);

COMMIT;
