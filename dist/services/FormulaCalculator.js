"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FormulaCalculator = void 0;
// src/services/FormulaCalculator.ts
const data_source_1 = require("../data-source");
const PlanSheets_1 = require("../entity/PlanSheets");
const FormulaCell_1 = require("../entity/FormulaCell");
// Note: formulajs installed with: npm install formulajs
const formulajs = require('formulajs');
class FormulaCalculator {
    static async calculateCell(sheetId, cellReference) {
        const formulaCellRepo = data_source_1.AppDataSource.getRepository(FormulaCell_1.FormulaCell);
        const planSheetRepo = data_source_1.AppDataSource.getRepository(PlanSheets_1.PlanSheet);
        const cell = await formulaCellRepo.findOne({
            where: { sheet: { id: sheetId }, cellReference },
            relations: ['sheet']
        });
        if (!cell)
            throw new Error('Cell not found');
        // Obtener valores de dependencias
        const dependencies = await this.getDependencyValues(cell.depends_on);
        // Ejecutar fórmula (simplificado)
        const result = this.evaluateFormula(cell.formula, dependencies);
        // Actualizar valor en la hoja
        const sheetData = JSON.parse(cell.sheet.data);
        const [col, row] = this.parseCellReference(cellReference);
        sheetData[row][col] = result;
        await planSheetRepo.update({ id: cell.sheet.id }, { data: JSON.stringify(sheetData) });
        return result;
    }
    static async getDependencyValues(dependencies) {
        // Implementar lógica para obtener valores de celdas dependientes
        return {};
    }
    static evaluateFormula(formula, context) {
        // Implementar evaluación segura de fórmulas
        try {
            return formulajs.parse(formula.replace(/^=/, ''), context);
        }
        catch (error) {
            console.error(`Error evaluating formula: ${formula}`, error);
            return null;
        }
    }
    static parseCellReference(ref) {
        // Convertir "A1" a [0, 0]
        const col = ref.match(/[A-Z]+/)[0];
        const row = parseInt(ref.match(/\d+/)[0]) - 1;
        return [
            col.charCodeAt(0) - 'A'.charCodeAt(0),
            row
        ];
    }
}
exports.FormulaCalculator = FormulaCalculator;
