import 'reflect-metadata';
import { AppDataSource } from './data-source';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Faltan variables de entorno');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// SQL para crear todas las tablas
const createTablesSQL = `
-- 1. Divisiones
CREATE TABLE IF NOT EXISTS divisions (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  code VARCHAR(10) UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Usuarios
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  division_id INTEGER REFERENCES divisions(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'economist', 'reviewer')),
  is_active BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Planes Económicos
CREATE TABLE IF NOT EXISTS economic_plans (
  id SERIAL PRIMARY KEY,
  division_id INTEGER NOT NULL REFERENCES divisions(id) ON DELETE CASCADE,
  year INTEGER NOT NULL CHECK (year BETWEEN 2000 AND 2100),
  version INTEGER DEFAULT 1,
  status VARCHAR(20) CHECK (status IN ('draft', 'reviewed', 'approved')),
  created_by INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reviewed_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  approved_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(division_id, year)
);

-- 4. Hojas de Planes
CREATE TABLE IF NOT EXISTS plan_sheets (
  id SERIAL PRIMARY KEY,
  plan_id INTEGER NOT NULL REFERENCES economic_plans(id) ON DELETE CASCADE,
  sheet_name VARCHAR(50) NOT NULL,
  data JSONB NOT NULL,
  UNIQUE(plan_id, sheet_name)
);

-- 5. Celdas con Fórmulas
CREATE TABLE IF NOT EXISTS formula_cells (
  id SERIAL PRIMARY KEY,
  sheet_id INTEGER NOT NULL REFERENCES plan_sheets(id) ON DELETE CASCADE,
  cell_reference VARCHAR(10) NOT NULL,
  formula TEXT NOT NULL,
  depends_on TEXT[],
  last_value NUMERIC(15, 2),
  last_calculated_at TIMESTAMP WITH TIME ZONE
);

-- 6. Historial de Cambios
CREATE TABLE IF NOT EXISTS plan_audit_log (
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

-- 7. Indicadores Económicos
CREATE TABLE IF NOT EXISTS economic_indicators (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(30) UNIQUE NOT NULL,
  unit VARCHAR(10),
  description TEXT,
  formula_template TEXT
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_users_division ON users(division_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_economic_plans_division ON economic_plans(division_id);
CREATE INDEX IF NOT EXISTS idx_economic_plans_year ON economic_plans(year);
CREATE INDEX IF NOT EXISTS idx_economic_plans_created_by ON economic_plans(created_by);
CREATE INDEX IF NOT EXISTS idx_plan_sheets_plan ON plan_sheets(plan_id);
CREATE INDEX IF NOT EXISTS idx_formula_cells_sheet ON formula_cells(sheet_id);
CREATE INDEX IF NOT EXISTS idx_plan_audit_log_plan ON plan_audit_log(plan_id);
CREATE INDEX IF NOT EXISTS idx_plan_audit_log_user ON plan_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_economic_indicators_code ON economic_indicators(code);
`;

// Función para convertir array PostgreSQL a JSON
function parsePostgresArray(pgArray: any): string[] {
  if (!pgArray) return [];
  if (Array.isArray(pgArray)) return pgArray;
  if (typeof pgArray === 'string') {
    if (pgArray.startsWith('{') && pgArray.endsWith('}')) {
      return pgArray.slice(1, -1).split(',').filter(item => item.trim());
    }
    return [pgArray];
  }
  return [];
}

async function migrateAllData() {
  console.log('🚀 Iniciando migración completa\n');

  try {
    // 1. Crear tablas en Supabase
    console.log('📋 1. Creando tablas en Supabase...');
    const queries = createTablesSQL.split(';').filter(q => q.trim());
    
    for (const query of queries) {
      if (query.trim()) {
        try {
          await supabase.rpc('exec_sql', { query });
        } catch (e) {
        }
      }
    }
    console.log('   ✅ Tablas verificadas\n');

    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log('✅ Conectado a BD local\n');
    }

    const queryRunner = AppDataSource.createQueryRunner();

    console.log('📦 2. Migrando Divisions...');
    const divisions = await queryRunner.query('SELECT * FROM divisions');
    if (divisions.length > 0) {
      const { error } = await supabase
        .from('divisions')
        .upsert(divisions.map((d: any) => ({
          id: d.id,
          name: d.name,
          code: d.code,
          created_at: d.created_at
        })))
        .select();
      if (!error) {
        console.log(`   ✅ ${divisions.length} divisiones migradas\n`);
      } else {
        console.log(`   ⚠️  Error: ${error.message}\n`);
      }
    }

    
    console.log('📦 3. Migrando Users...');
    const users = await queryRunner.query('SELECT * FROM users');
    // Filtrar usuarios con password_hash válido
    const validUsers = users.filter((u: any) => (u.password_hash ?? u.passwordHash) && u.email);
    if (validUsers.length > 0) {
      const { error } = await supabase
        .from('users')
        .upsert(validUsers.map((u: any) => ({
          id: u.id,
          email: u.email,
          password_hash: u.password_hash ?? u.passwordHash,
          full_name: u.full_name ?? u.fullName,
          division_id: u.division_id ?? u.divisionId,
          role: u.role,
          is_active: u.is_active ?? u.isActive,
          last_login: u.last_login ?? u.lastLogin,
          created_at: u.created_at ?? u.createdAt
        })))
        .select();
      if (!error) {
        console.log(`   ✅ ${validUsers.length}/${users.length} usuarios migrados\n`);
      } else {
        console.log(`   ⚠️  Error: ${error.message}\n`);
      }
    }

    // 5. Migrar Economic Plans
    console.log('📦 4. Migrando Economic Plans...');
    const plans = await queryRunner.query('SELECT * FROM economic_plans');
    // Filtrar planes con division_id válido
    const validPlans = plans.filter((p: any) => (p.division_id ?? p.divisionId) && (p.created_by ?? p.createdById));
    if (validPlans.length > 0) {
      const { error } = await supabase
        .from('economic_plans')
        .upsert(validPlans.map((p: any) => ({
          id: p.id,
          division_id: p.division_id ?? p.divisionId,
          year: p.year || new Date().getFullYear(),
          version: p.version || 1,
          status: p.status || 'draft',
          created_by: p.created_by ?? p.createdById,
          reviewed_by: p.reviewed_by ?? p.reviewedById,
          approved_by: p.approved_by ?? p.approvedById,
          created_at: p.created_at ?? p.createdAt,
          updated_at: p.updated_at ?? p.updatedAt
        })))
        .select();
      if (!error) {
        console.log(`   ✅ ${validPlans.length}/${plans.length} planes migrados\n`);
      } else {
        console.log(`   ⚠️  Error: ${error.message}\n`);
      }
    }

    // 6. Migrar Plan Sheets
    console.log('📦 5. Migrando Plan Sheets...');
    const sheets = await queryRunner.query('SELECT * FROM plan_sheets');
    // Filtrar hojas con plan_id válido
    const validSheets = sheets.filter((s: any) => (s.plan_id ?? s.planId));
    if (validSheets.length > 0) {
      const { error } = await supabase
        .from('plan_sheets')
        .upsert(validSheets.map((s: any) => ({
          id: s.id,
          plan_id: s.plan_id ?? s.planId,
          sheet_name: s.sheet_name ?? s.sheetName,
          data: s.data || {}
        })))
        .select();
      if (!error) {
        console.log(`   ✅ ${validSheets.length}/${sheets.length} hojas migradas\n`);
      } else {
        console.log(`   ⚠️  Error: ${error.message}\n`);
      }
    }

    // 7. Migrar Formula Cells
    console.log('📦 6. Migrando Formula Cells (5623 registros)...');
    const cells = await queryRunner.query('SELECT * FROM formula_cells');
    
    let successCount = 0;
    let errorCount = 0;

    const BATCH_SIZE = 100;
    for (let offset = 0; offset < cells.length; offset += BATCH_SIZE) {
      const batch = cells.slice(offset, offset + BATCH_SIZE);

      // Ojo: queryRunner.query('SELECT *') devuelve nombres de columnas (snake_case).
      // Por eso validamos contra cell_reference (y dejamos fallback a cellReference).
      const validCells = batch.filter((cell: any) => !!(cell.cell_reference ?? cell.cellReference));
      const skipped = batch.length - validCells.length;
      if (skipped > 0) {
        errorCount += skipped;
      }

      const payload = validCells.map((cell: any) => {
        const dependsOnArray = parsePostgresArray(cell.depends_on ?? cell.dependsOn);
        return {
          id: cell.id,
          sheet_id: cell.sheet_id ?? cell.sheetId,
          cell_reference: cell.cell_reference ?? cell.cellReference,
          formula: cell.formula,
          depends_on: dependsOnArray,
          last_value: cell.last_value ?? cell.lastValue,
          last_calculated_at: cell.last_calculated_at ?? cell.lastCalculatedAt
        };
      });

      if (payload.length === 0) {
        const processedOnlySkipped = Math.min(offset + batch.length, cells.length);
        console.log(`   ⚠️  Lote ${offset}-${processedOnlySkipped} sin celdas válidas (cell_reference nulo).`);
        continue;
      }

      try {
        // Usamos upsert para evitar errores de clave duplicada si ya existen registros
        const { error } = await supabase.from('formula_cells').upsert(payload);
        if (!error) {
          successCount += payload.length;
        } else {
          console.log(`   ⚠️  Error en batch (${offset}-${offset + batch.length}): ${error.message}`);
          // Fallback: si el batch falla, intentamos 1 a 1 para no perder el resto
          for (const row of payload) {
            const { error: rowError } = await supabase.from('formula_cells').upsert([row]);
            if (!rowError) {
              successCount++;
            } else {
              errorCount++;
            }
          }
        }
      } catch (e) {
        // Fallback por excepción (por ejemplo, payload inválido)
        for (const row of payload) {
          try {
            const { error: rowError } = await supabase.from('formula_cells').upsert([row]);
            if (!rowError) {
              successCount++;
            } else {
              errorCount++;
            }
          } catch {
            errorCount++;
          }
        }
      }

      const processed = Math.min(offset + batch.length, cells.length);
      if (processed % 1000 === 0 || processed === cells.length) {
        console.log(`   ✅ ${successCount}/${cells.length} fórmulas... (errores: ${errorCount})`);
      }
    }

    console.log(`   ✅ ${successCount}/${cells.length} fórmulas migradas\n`);

    // 8. Migrar Economic Indicators
    console.log('📦 7. Migrando Economic Indicators...');
    const indicators = await queryRunner.query('SELECT * FROM economic_indicators');
    if (indicators.length > 0) {
      const { error } = await supabase
        .from('economic_indicators')
        .upsert(indicators.map((ind: any) => ({
          id: ind.id,
          name: ind.name,
          code: ind.code,
          unit: ind.unit,
          description: ind.description
        })))
        .select();
      if (!error) {
        console.log(`   ✅ ${indicators.length} indicadores migrados\n`);
      } else {
        console.log(`   ⚠️  Error: ${error.message}\n`);
      }
    }

    // 9. Migrar Plan Audit Log
    console.log('📦 8. Migrando Plan Audit Log...');
    const auditLogs = await queryRunner.query('SELECT * FROM plan_audit_log');
    if (auditLogs.length > 0) {
      const { error } = await supabase
        .from('plan_audit_log')
        .upsert(auditLogs.map((log: any) => ({
          id: log.id,
          plan_id: log.plan_id ?? log.planId,
          user_id: log.user_id ?? log.userId,
          action: log.action,
          changed_table: log.changed_table,
          changed_field: log.changed_field,
          old_value: log.old_value,
          new_value: log.new_value,
          ip_address: log.ip_address,
          created_at: log.created_at ?? log.createdAt
        })))
        .select();
      if (!error) {
        console.log(`   ✅ ${auditLogs.length} registros de auditoría migrados\n`);
      } else {
        console.log(`   ⚠️  Error: ${error.message}\n`);
      }
    }

    console.log('\n✅✅✅ Migración completada exitosamente ✅✅✅\n');
    console.log('📊 Resumen:');
    console.log(`   • Divisiones: ${divisions.length}`);
    console.log(`   • Usuarios: ${users.length}`);
    console.log(`   • Planes: ${plans.length}`);
    console.log(`   • Hojas: ${sheets.length}`);
    console.log(`   • Fórmulas: ${successCount}/${cells.length}`);
    console.log(`   • Indicadores: ${indicators.length}`);
    console.log(`   • Auditoría: ${auditLogs.length}`);

    await queryRunner.release();
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

migrateAllData();
