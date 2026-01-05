// src/services/FormulaCalculator.ts
import { AppDataSource } from '../data-source';
import { PlanSheet } from '../entity/PlanSheets';
import { FormulaCell } from '../entity/FormulaCell';
// Note: formulajs installed with: npm install formulajs
const formulajs = require('formulajs');

export class FormulaCalculator {
  static async calculateCell(sheetId: number, cellReference: string) {
    const formulaCellRepo = AppDataSource.getRepository(FormulaCell);
    const planSheetRepo = AppDataSource.getRepository(PlanSheet);
    
    const cell = await formulaCellRepo.findOne({ 
      where: { sheet: { id: sheetId }, cellReference },
      relations: ['sheet']
    });

    if (!cell) throw new Error('Cell not found');

    // Obtener valores de dependencias
    const dependencies = await this.getDependencyValues(cell.depends_on);

    // Ejecutar fórmula (simplificado)
    const result = this.evaluateFormula(cell.formula, dependencies);
    
    // Actualizar valor en la hoja
    const sheetData = JSON.parse(cell.sheet.data);
    const [col, row] = this.parseCellReference(cellReference);
    sheetData[row][col] = result;
    
    await planSheetRepo.update({ id: cell.sheet.id }, { data: JSON.stringify(sheetData) } as any);
    
    return result;
  }

  private static async getDependencyValues(dependencies: string[]) {
    // Implementar lógica para obtener valores de celdas dependientes
    return {};
  }

  private static evaluateFormula(formula: string, context: any) {
    // Implementar evaluación segura de fórmulas
    try {
      return formulajs.parse(formula.replace(/^=/, ''), context);
    } catch (error) {
      console.error(`Error evaluating formula: ${formula}`, error);
      return null;
    }
  }

  private static parseCellReference(ref: string): [number, number] {
    // Convertir "A1" a [0, 0]
    const col = ref.match(/[A-Z]+/)![0];
    const row = parseInt(ref.match(/\d+/)![0]) - 1;
    return [
      col.charCodeAt(0) - 'A'.charCodeAt(0),
      row
    ];
  }
} 