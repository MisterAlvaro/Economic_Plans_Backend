"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExcelProcessor = void 0;
// src/services/ExcelProcessor.ts
const XLSX = __importStar(require("xlsx"));
const data_source_1 = require("../data-source");
const PlanSheets_1 = require("../entity/PlanSheets");
const FormulaCell_1 = require("../entity/FormulaCell");
class ExcelProcessor {
    static async process(fileBuffer, planId) {
        const workbook = XLSX.read(fileBuffer, { type: 'buffer', cellFormula: true });
        const planSheetRepo = data_source_1.AppDataSource.getRepository(PlanSheets_1.PlanSheet);
        const formulaCellRepo = data_source_1.AppDataSource.getRepository(FormulaCell_1.FormulaCell);
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
            let planSheet;
            if (existingSheet) {
                // Actualizar hoja existente
                existingSheet.data = JSON.stringify(sheetData);
                planSheet = await planSheetRepo.save(existingSheet);
                // Eliminar fórmulas existentes para esta hoja
                await formulaCellRepo.delete({ sheet: { id: planSheet.id } });
            }
            else {
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
    }
    static extractDependencies(formula) {
        // Implementar lógica similar al script Python
        const refs = formula.match(/(?:'?([A-Za-z0-9-]+)'?\!)?\$?[A-Z]+\$?\d+/g) || [];
        return [...new Set(refs)]; // Eliminar duplicados
    }
}
exports.ExcelProcessor = ExcelProcessor;
