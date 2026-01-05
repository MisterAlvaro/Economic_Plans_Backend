// src/controller/FormulaCellController.ts
import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { FormulaCell } from '../entity/FormulaCell';

export class FormulaCellController {
  static async getBySheet(req: Request, res: Response) {
    const sheetId = parseInt(req.params.sheetId);
    const cells = await AppDataSource.getRepository(FormulaCell).find({
      where: { sheet: { id: sheetId } }
    });
    return res.json(cells);
  }
} 