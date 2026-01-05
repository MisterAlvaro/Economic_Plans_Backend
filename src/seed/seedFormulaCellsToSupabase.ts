import 'reflect-metadata';
import { AppDataSource } from '../data-source';
import { FormulaCell } from '../entity/FormulaCell';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Error: Faltan variables de entorno SUPABASE_URL y/o SUPABASE_SERVICE_ROLE_KEY');
  console.error('Por favor, agrega estas variables a tu archivo .env');
  process.exit(1);
}

// Cliente de Supabase con clave de servicio (para poder insertar datos)
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function seedFormulaCells() {
  try {
    console.log('🔄 Conectando a la base de datos local...');
    
    // Conexión a tu Postgres local (TypeORM)
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    const formulaCellRepo = AppDataSource.getRepository(FormulaCell);

    // Traemos todas las formula_cells desde la BD local, incluyendo la relación con sheet
    console.log('📖 Leyendo formula_cells de la base de datos local...');
    const cells = await formulaCellRepo.find({
      relations: ['sheet'],
    });

    console.log(`✅ Encontradas ${cells.length} formula_cells en la BD local`);

    if (cells.length === 0) {
      console.log('⚠️  No hay datos para migrar. Saliendo...');
      await AppDataSource.destroy();
      return;
    }

    // Adaptamos los datos al formato de la tabla formula_cells en Supabase
    const rows = cells.map((c) => {
      const row: any = {
        sheet_id: c.sheet?.id,
        cell_reference: c.cellReference,
        formula: c.formula,
        depends_on: c.depends_on || [],
        last_value: c.last_value,
        last_calculated_at: c.last_calculated_at,
      };

      // Solo incluir el id si existe (para evitar conflictos con auto-increment en Supabase)
      // Si quieres conservar los IDs originales, descomenta la siguiente línea:
      // row.id = c.id;

      return row;
    });

    // Verificar que todas las filas tengan sheet_id válido
    const invalidRows = rows.filter(r => !r.sheet_id);
    if (invalidRows.length > 0) {
      console.warn(`⚠️  Advertencia: ${invalidRows.length} filas sin sheet_id válido serán omitidas`);
    }

    const validRows = rows.filter(r => r.sheet_id);

    console.log(`📤 Preparando ${validRows.length} filas para insertar en Supabase...`);

    // Insertamos en Supabase en bloques para evitar problemas de memoria
    const chunkSize = 500;
    let totalInserted = 0;

    for (let i = 0; i < validRows.length; i += chunkSize) {
      const chunk = validRows.slice(i, i + chunkSize);
      const chunkNumber = Math.floor(i / chunkSize) + 1;
      const totalChunks = Math.ceil(validRows.length / chunkSize);

      console.log(`📦 Insertando chunk ${chunkNumber}/${totalChunks} (${chunk.length} filas)...`);

      const { data, error } = await supabase
        .from('formula_cells')
        .insert(chunk)
        .select();

      if (error) {
        console.error(`❌ Error insertando chunk ${chunkNumber}:`, error);
        throw error;
      } else {
        totalInserted += chunk.length;
        console.log(`✅ Chunk ${chunkNumber} insertado correctamente (${totalInserted}/${validRows.length} total)`);
      }
    }

    console.log(`\n🎉 Seed completado exitosamente!`);
    console.log(`   Total de filas insertadas: ${totalInserted}`);
    console.log(`   Filas omitidas (sin sheet_id): ${invalidRows.length}`);

  } catch (error) {
    console.error('❌ Error en el seed de formula_cells:', error);
    throw error;
  } finally {
    // Cerrar conexión a la BD local
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('🔌 Conexión a la base de datos local cerrada');
    }
  }
}

// Ejecutar el seed
seedFormulaCells()
  .then(() => {
    console.log('✨ Proceso finalizado');
    process.exit(0);
  })
  .catch((err) => {
    console.error('💥 Error fatal:', err);
    process.exit(1);
  });

