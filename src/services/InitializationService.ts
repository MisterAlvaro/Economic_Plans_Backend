import { AppDataSource } from '../data-source';
import { Division } from '../entity/Division';

export class InitializationService {
  static async initializeDefaultData() {
    try {
      console.log('🔧 Inicializando datos por defecto...');
      
      await this.initializeDefaultDivisions();
      
      console.log('✅ Datos por defecto inicializados correctamente');
      console.log('📊 Los indicadores económicos se extraerán automáticamente al subir el Excel');
    } catch (error) {
      console.error('❌ Error al inicializar datos por defecto:', error);
    }
  }

  private static async initializeDefaultDivisions() {
    const divisionRepository = AppDataSource.getRepository(Division);
    
    const defaultDivisions = [
      { name: 'Oficina Central', code: 'OC001' },
      { name: 'División Occidente', code: 'DO001' },
      { name: 'División Matanzas', code: 'DM001' },
      { name: 'División Nuevitas', code: 'DN001' },
      { name: 'División Santiago de Cuba', code: 'DSC001' }
    ];

    for (const divisionData of defaultDivisions) {
      const existingDivision = await divisionRepository.findOne({
        where: [
          { name: divisionData.name },
          { code: divisionData.code }
        ]
      });

      if (!existingDivision) {
        const division = divisionRepository.create(divisionData);
        await divisionRepository.save(division);
        console.log(`📁 División creada: ${divisionData.name}`);
      } else {
        console.log(`📁 División ya existe: ${divisionData.name}`);
      }
    }

    const allDivisions = await divisionRepository.find({ order: { id: 'ASC' } });
    console.log('\n📋 Divisiones disponibles:');
    allDivisions.forEach(div => {
      console.log(`   ID: ${div.id} | ${div.name} (${div.code})`);
    });
  }
} 