import { AppDataSource } from '../data-source';
import { User } from '../entity/User';
import { Division } from '../entity/Division';
import { EconomicPlan } from '../entity/EconomicPlans';
import * as bcrypt from 'bcrypt';

async function seedTestData() {
  try {
    await AppDataSource.initialize();
    console.log('✅ Conectado a la base de datos');

    const divisionRepository = AppDataSource.getRepository(Division);
    const userRepository = AppDataSource.getRepository(User);
    const planRepository = AppDataSource.getRepository(EconomicPlan);

    // Create divisions (idempotent)
    console.log('🌱 Creando/validando divisiones...');
    const divisionSeeds = [
      { name: 'Finanzas', code: 'FIN' },
      { name: 'Operaciones', code: 'OPE' },
      { name: 'Recursos Humanos', code: 'RH' },
    ];

    const divisions: Division[] = [];
    for (const divisionSeed of divisionSeeds) {
      let division = await divisionRepository.findOne({ where: { code: divisionSeed.code } });

      if (!division) {
        division = divisionRepository.create(divisionSeed);
        await divisionRepository.save(division);
      }

      divisions.push(division);
    }
    console.log(`✅ ${divisions.length} divisiones listas`);

    // Create users with different roles
    console.log('👥 Creando usuarios...');
    const saltRounds = 10;
    
    // Admin user (no division)
    const adminEmail = 'admin@economicplans.local';
    const existingAdmin = await userRepository.findOne({ where: { email: adminEmail } });
    if (!existingAdmin) {
      const adminUser = new User();
      adminUser.email = adminEmail;
      adminUser.passwordHash = await bcrypt.hash('Admin123!', saltRounds);
      adminUser.fullName = 'Administrador Sistema';
      adminUser.role = 'admin';
      adminUser.is_active = true;
      await userRepository.save(adminUser);
    }

    // Economist users
    const economistSeeds = [
      {
        email: 'economist1@economicplans.local',
        fullName: 'Juan Economista',
        division: divisions[0], // Finanzas
      },
      {
        email: 'economist2@economicplans.local',
        fullName: 'María Analista',
        division: divisions[1], // Operaciones
      },
    ];

    for (const economistSeed of economistSeeds) {
      const existingEconomist = await userRepository.findOne({ where: { email: economistSeed.email } });
      if (!existingEconomist) {
        const economist = new User();
        economist.email = economistSeed.email;
        economist.passwordHash = await bcrypt.hash('Economist123!', saltRounds);
        economist.fullName = economistSeed.fullName;
        economist.role = 'economist';
        economist.is_active = true;
        economist.division = economistSeed.division;
        await userRepository.save(economist);
      }
    }

    // Remove legacy reviewer users to keep role model consistent
    await userRepository
      .createQueryBuilder()
      .delete()
      .from(User)
      .where('role = :role', { role: 'reviewer' })
      .execute();

    console.log(`✅ 3 usuarios creados`);

    const existingPlansCount = await planRepository.count();
    await planRepository.createQueryBuilder().delete().from(EconomicPlan).execute();
    console.log(`🧹 Planes eliminados: ${existingPlansCount}`);
    console.log('ℹ️ Seed configurado para no crear planes económicos');

    console.log('\n📊 Datos de Prueba Creados:');
    console.log('\n🔑 Credenciales:');
    console.log('  Admin:');
    console.log('    Email: admin@economicplans.local');
    console.log('    Contraseña: Admin123!');
    console.log('\n  Economista (Finanzas):');
    console.log('    Email: economist1@economicplans.local');
    console.log('    Contraseña: Economist123!');
    console.log('\n  Economista (Operaciones):');
    console.log('    Email: economist2@economicplans.local');
    console.log('    Contraseña: Economist123!');
    console.log('\n✨ Seed completado exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error durante seed:', error);
    process.exit(1);
  }
}

seedTestData();
