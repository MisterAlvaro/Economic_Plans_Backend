import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { EconomicIndicator } from '../entity/EconomicIndicator';

export class EconomicIndicatorController {
  static async getAll(req: Request, res: Response) {
    const indicators = await AppDataSource.getRepository(EconomicIndicator).find();
    return res.json(indicators);
  }

  static async create(req: Request, res: Response) {
    const { name, code, unit, description, formulaTemplate } = req.body;
    const indicatorRepo = AppDataSource.getRepository(EconomicIndicator);

    // Validar duplicados por código
    const existing = await indicatorRepo.findOne({ where: { code } });
    if (existing) {
      return res.status(409).json({
        message: `Ya existe un indicador con el código '${code}'.`
      });
    }

    const indicator = indicatorRepo.create({ name, code, unit, description, formulaTemplate });
    await indicatorRepo.save(indicator);
    return res.status(201).json(indicator);
  }
} 