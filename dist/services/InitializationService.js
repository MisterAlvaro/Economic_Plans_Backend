"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InitializationService = void 0;
const data_source_1 = require("../data-source");
const Division_1 = require("../entity/Division");
const EconomicIndicator_1 = require("../entity/EconomicIndicator");
class InitializationService {
    static async initializeDefaultData() {
        try {
            console.log('🔧 Inicializando datos por defecto...');
            await this.initializeDefaultDivisions();
            await this.initializeDefaultIndicators();
            console.log('✅ Datos por defecto inicializados correctamente');
        }
        catch (error) {
            console.error('❌ Error al inicializar datos por defecto:', error);
        }
    }
    static async initializeDefaultDivisions() {
        const divisionRepository = data_source_1.AppDataSource.getRepository(Division_1.Division);
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
            }
            else {
                console.log(`📁 División ya existe: ${divisionData.name}`);
            }
        }
        const allDivisions = await divisionRepository.find({ order: { id: 'ASC' } });
        console.log('\n📋 Divisiones disponibles:');
        allDivisions.forEach(div => {
            console.log(`   ID: ${div.id} | ${div.name} (${div.code})`);
        });
    }
    static async initializeDefaultIndicators() {
        const indicatorRepository = data_source_1.AppDataSource.getRepository(EconomicIndicator_1.EconomicIndicator);
        const defaultIndicators = [
            {
                name: 'Inflación IPC',
                code: 'IPC',
                unit: '%',
                description: 'Índice de Precios al Consumidor',
                formulaTemplate: 'A1 * 1.05'
            },
            {
                name: 'Tasa de Cambio USD',
                code: 'USD',
                unit: 'CUP',
                description: 'Tasa de cambio del dólar estadounidense',
                formulaTemplate: 'A1 * 120'
            },
            {
                name: 'Productividad Laboral',
                code: 'PROD',
                unit: 'MP/hora',
                description: 'Productividad medida en MP por hora trabajada',
                formulaTemplate: 'A1 / B1'
            },
            {
                name: 'Costo de Producción',
                code: 'COST',
                unit: 'MP',
                description: 'Costo total de producción',
                formulaTemplate: 'A1 + B1 + C1'
            },
            {
                name: 'Margen de Utilidad',
                code: 'MARG',
                unit: '%',
                description: 'Margen de utilidad sobre ventas',
                formulaTemplate: '(A1 - B1) / A1 * 100'
            },
            {
                name: 'Rentabilidad de la Inversión',
                code: 'ROI',
                unit: '%',
                description: 'Retorno sobre la inversión',
                formulaTemplate: 'A1 / B1 * 100'
            }
        ];
        for (const indicatorData of defaultIndicators) {
            const existingIndicator = await indicatorRepository.findOne({
                where: { code: indicatorData.code }
            });
            if (!existingIndicator) {
                const indicator = indicatorRepository.create(indicatorData);
                await indicatorRepository.save(indicator);
                console.log(`📊 Indicador creado: ${indicatorData.name} (${indicatorData.code})`);
            }
            else {
                console.log(`📊 Indicador ya existe: ${indicatorData.name} (${indicatorData.code})`);
            }
        }
        const allIndicators = await indicatorRepository.find({ order: { id: 'ASC' } });
        console.log('\n📊 Indicadores económicos disponibles:');
        allIndicators.forEach(ind => {
            console.log(`   ID: ${ind.id} | ${ind.name} (${ind.code}) - ${ind.unit}`);
        });
    }
}
exports.InitializationService = InitializationService;
