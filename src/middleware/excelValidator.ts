// src/middleware/excelValidator.ts
import { Request, Response, NextFunction } from 'express';
import * as XLSX from 'xlsx';
import fs from 'fs';

const EXPECTED_HEADERS: Record<string, string[]> = {
  'Resumen': ['Indicadores', 'UM', 'Real 2023', 'Real. 2024', 'Plan 2025', '∑(Ene-Dic)', 'Trim I', 'Trim II', 'Trim III', 'Trim IV'],
  'IndEco': ['Indicadores', 'UM', 'Real 2023', 'Real. 2024', 'Plan 2025', '∑(Ene-Dic)', 'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
  'Est. Costo': ['Indicadores', 'Real 2023', 'Real. 2024', 'Plan 2025', '∑(Ene-Dic)', 'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
};

export function validateExcelUpload(req: Request, res: Response, next: NextFunction) {
  const file = req.file;
  if (!file) return res.status(400).json({ message: 'Excel file is required' });

  try {
    const workbook = XLSX.readFile(file.path);
    const sheetNames = Object.keys(EXPECTED_HEADERS);

    for (const sheet of sheetNames) {
      const worksheet = workbook.Sheets[sheet];
      if (!worksheet) {
        fs.unlinkSync(file.path);
        return res.status(400).json({ message: `Missing required sheet: ${sheet}` });
      }

      const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
      
      // Buscar la fila de headers en las primeras 10 filas
      let headerRow = null;
      let headerRowIndex = -1;
      
      for (let i = 0; i < Math.min(10, json.length); i++) {
        const row = json[i];
        if (row && row.length > 0) {
          const expectedHeaders = EXPECTED_HEADERS[sheet];
          const hasAllHeaders = expectedHeaders.every((header: string) => row.includes(header));
          
          if (hasAllHeaders) {
            headerRow = row;
            headerRowIndex = i;
            console.log(`Headers encontrados en fila ${i + 1} para hoja "${sheet}"`);
            break;
          }
        }
      }
      
      if (!headerRow) {
        fs.unlinkSync(file.path);
        return res.status(400).json({
          message: `Sheet "${sheet}" does not contain expected headers in first 10 rows`,
          expected: EXPECTED_HEADERS[sheet],
          availableRows: json.slice(0, 10).map((row, i) => `Row ${i + 1}: ${row.slice(0, 5).join(', ')}...`)
        });
      }
      
      const expectedHeaders = EXPECTED_HEADERS[sheet];

      const planIndex = headerRow.indexOf('Plan 2025');
      const sumIndex = headerRow.indexOf('∑(Ene-Dic)');
      const monthIndices = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']
        .map(m => headerRow.indexOf(m)).filter(i => i >= 0);

      const dataRows = json.slice(headerRowIndex + 1);
      let foundEndOfData = false;
      
      for (const [rowIndex, row] of dataRows.entries()) {
        // Si ya encontramos el final de los datos, saltar todo lo que sigue
        if (foundEndOfData) {
          continue;
        }
        
        // Solo validar filas que tengan datos numéricos reales
        const hasData = row && row.length > 0 && row.some((cell: any) => cell !== null && cell !== '' && cell !== undefined);
        
        if (!hasData) {
          continue; // Saltar filas vacías
        }

        const firstCell = row[0];
        
        // Si la primera celda está vacía o es undefined, probablemente es una fila de firmas
        if (!firstCell || firstCell === undefined || firstCell === '') {
          foundEndOfData = true; // Marcar que llegamos al final de los datos
          console.log(`Fin de datos detectado en fila ${rowIndex + 5} (celda vacía)`);
          continue;
        }
        
        // Verificar si contiene palabras relacionadas con firmas/aprobaciones
        const cellText = String(firstCell).toLowerCase();
        const isSignatureRow = cellText.includes('elaborado') ||
          cellText.includes('revisado') ||
          cellText.includes('aprobado') ||
          cellText.includes('firma') ||
          cellText.includes('fecha') ||
          cellText.includes('responsable') ||
          cellText.includes('nombre') ||
          cellText.includes('cargo') ||
          cellText.includes('firmado') ||
          cellText.includes('aprobado por') ||
          cellText.includes('revisado por') ||
          cellText.includes('elaborado por') ||
          cellText.includes('____') || // Líneas para firmar
          cellText.includes('---') ||  // Líneas para firmar
          cellText.includes('...') ||  // Puntos suspensivos
          cellText.includes('total') || // Totales (a veces están al final)
          cellText.includes('resumen'); // Resúmenes

        if (isSignatureRow) {
          foundEndOfData = true; // Marcar que llegamos al final de los datos
          console.log(`Fin de datos detectado en fila ${rowIndex + 5} (firma/aprobación): "${firstCell}"`);
          continue;
        }

        const numericColumns = (row as any[]).slice(4);
        for (const value of numericColumns) {
          if (value !== null && value !== '') {
            // Limpiar el valor: remover comas y espacios, convertir a número
            const cleanValue = String(value).replace(/,/g, '').trim();
            if (isNaN(Number(cleanValue))) {
              console.log(`ERROR en fila ${rowIndex + 5}: valor no numérico="${value}", limpio="${cleanValue}"`);
              fs.unlinkSync(file.path);
              return res.status(400).json({
                message: `Non-numeric value found in sheet "${sheet}" at row ${rowIndex + 5}`,
                value: value
              });
            }
          }
        }

        if (planIndex >= 0) {
          const planValue = (row as any[])[planIndex];
          
          if (planValue !== null && planValue !== '' && planValue !== undefined) {
            // Limpiar el valor: remover comas y espacios, convertir a número
            const cleanValue = String(planValue).replace(/,/g, '').trim();
            const numericValue = Number(cleanValue);
            
            if (isNaN(numericValue) || numericValue < 0) {
              fs.unlinkSync(file.path);
              return res.status(400).json({
                message: `"Plan 2025" value must be a non-negative number in sheet "${sheet}" at row ${rowIndex + 5}`,
                value: planValue
              });
            }
          } else {
            fs.unlinkSync(file.path);
            return res.status(400).json({
              message: `"Plan 2025" value must be a number in sheet "${sheet}" at row ${rowIndex + 5}`,
              value: planValue
            });
          }
        }

        if (sumIndex >= 0 && monthIndices.length > 0) {
          const monthSum = monthIndices.reduce((acc, i) => {
            const value = (row as any[])[i];
            const cleanValue = String(value || 0).replace(/,/g, '').trim();
            return acc + (parseFloat(cleanValue) || 0);
          }, 0);
          const reportedSumValue = (row as any[])[sumIndex];
          const cleanReportedSum = String(reportedSumValue || 0).replace(/,/g, '').trim();
          const reportedSum = parseFloat(cleanReportedSum) || 0;
          const diff = Math.abs(monthSum - reportedSum);
          if (diff > 1e-2) {
            fs.unlinkSync(file.path);
            return res.status(400).json({
              message: `Sum mismatch in "${sheet}" at row ${rowIndex + 5}. Expected ∑(Ene-Dic) ≈ ${monthSum}, found ${reportedSum}`
            });
          }
        }
      }
    }

    next();
  } catch (error) {
    if (file && fs.existsSync(file.path)) fs.unlinkSync(file.path);
    return res.status(400).json({ message: 'Invalid Excel file format' });
  }
} 