// src/services/ExcelProcessor.ts
import * as XLSX from 'xlsx';
import { AppDataSource } from '../data-source';
import { EconomicPlan } from '../entity/EconomicPlans';
import { PlanSheet } from '../entity/PlanSheets';
import { FormulaCell } from '../entity/FormulaCell';
import { EconomicIndicator } from '../entity/EconomicIndicator';

export class ExcelProcessor {
  static async process(fileBuffer: Buffer, planId: number) {
    const workbook = XLSX.read(fileBuffer, { type: 'buffer', cellFormula: true });
    const planSheetRepo = AppDataSource.getRepository(PlanSheet);
    const formulaCellRepo = AppDataSource.getRepository(FormulaCell);
    const indicatorRepo = AppDataSource.getRepository(EconomicIndicator);

    // Extraer indicadores económicos de la hoja "Resumen"
    await this.extractEconomicIndicators(workbook, indicatorRepo);

    for (const sheetName of workbook.SheetNames) {
      // Verificar si la hoja ya existe
      const existingSheet = await planSheetRepo.findOne({
        where: { 
          plan: { id: planId }, 
          sheetName 
        }
      });

      const sheet = workbook.Sheets[sheetName];
      const sheetData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
      
      let planSheet: PlanSheet;
      
      if (existingSheet) {
        // Actualizar hoja existente
        existingSheet.data = JSON.stringify(sheetData);
        planSheet = await planSheetRepo.save(existingSheet);
        
        // Eliminar fórmulas existentes para esta hoja
        await formulaCellRepo.delete({ sheet: { id: planSheet.id } });
      } else {
        // Crear nueva hoja
        planSheet = await planSheetRepo.save({
          plan: { id: planId },
          sheetName,
          data: JSON.stringify(sheetData)
        });
      }

      // Extraer fórmulas
      for (const cellAddress in sheet) {
        const cell = sheet[cellAddress];
        if (cell.f) {
          await formulaCellRepo.save({
            sheet: { id: planSheet.id },
            cellReference: cellAddress,
            formula: cell.f,
            depends_on: this.extractDependencies(cell.f)
          });
        }
      }
    }

    return workbook.SheetNames.length;
  }

  private static async extractEconomicIndicators(workbook: XLSX.WorkBook, indicatorRepo: any) {
    const resumenSheet = workbook.Sheets['Resumen'];
    if (!resumenSheet) {
      console.log('⚠️ No se encontró la hoja "Resumen" para extraer indicadores');
      return;
    }

    // Convertir la hoja a JSON para procesar los datos
    const sheetData = XLSX.utils.sheet_to_json(resumenSheet, { header: 1 });
    
    // Buscar la fila de headers (normalmente fila 4 según el log)
    let headerRowIndex = -1;
    for (let i = 0; i < sheetData.length; i++) {
      const row = sheetData[i] as any[];
      if (row && row[0] && row[0].toString().includes('Indicadores')) {
        headerRowIndex = i;
        break;
      }
    }

    if (headerRowIndex === -1) {
      console.log('⚠️ No se encontró la fila de headers de indicadores');
      return;
    }

    // Procesar cada fila de indicadores
    for (let i = headerRowIndex + 1; i < sheetData.length; i++) {
      const row = sheetData[i] as any[];
      if (!row || !row[0] || typeof row[0] !== 'string') continue;

      const indicatorName = row[0].toString().trim();
      
      // Saltar filas vacías o de totales
      if (!indicatorName || indicatorName.includes('Total') || indicatorName.includes('Elaborado') || indicatorName.includes('Revisado') || indicatorName.includes('Aprobado')) {
        continue;
      }

      // Extraer unidad de medida (columna B)
      const unit = row[1] ? row[1].toString().trim() : '';
      
      // Crear código único basado en el nombre
      const code = this.generateIndicatorCode(indicatorName);
      
      // Verificar si el indicador ya existe
      const existingIndicator = await indicatorRepo.findOne({
        where: { code }
      });

      if (!existingIndicator) {
        const indicator = indicatorRepo.create({
          name: indicatorName,
          code,
          unit,
          description: `Indicador extraído automáticamente: ${indicatorName}`,
          formulaTemplate: null
        });

        await indicatorRepo.save(indicator);
        console.log(`📊 Indicador creado: ${indicatorName} (${code}) - ${unit}`);
      } else {
        console.log(`📊 Indicador ya existe: ${indicatorName} (${code})`);
      }
    }
  }

  private static generateIndicatorCode(name: string): string {
    // Generar código único basado en el nombre
    const words = name.split(' ');
    let code = '';
    
    for (const word of words) {
      if (word.length > 0) {
        code += word.charAt(0).toUpperCase();
      }
    }
    
    // Si el código es muy largo, tomar solo las primeras letras
    if (code.length > 10) {
      code = code.substring(0, 10);
    }
    
    // Si el código está vacío, usar un código genérico
    if (code.length === 0) {
      code = 'IND';
    }
    
    return code;
  }

  private static extractDependencies(formula: string): string[] {
    // Implementar lógica similar al script Python
    const refs = formula.match(/(?:'?([A-Za-z0-9-]+)'?\!)?\$?[A-Z]+\$?\d+/g) || [];
    return [...new Set(refs)]; // Eliminar duplicados
  }
} 