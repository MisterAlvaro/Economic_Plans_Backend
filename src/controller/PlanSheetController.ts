// src/controller/PlanSheetController.ts
import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { PlanSheet } from '../entity/PlanSheets';

export class PlanSheetController {
  static async getByPlan(req: Request, res: Response) {
    const planId = parseInt(req.params.planId);
    const sheets = await AppDataSource.getRepository(PlanSheet).find({
      where: { plan: { id: planId } },
      relations: ['plan']
    });
    return res.json(sheets);
  }
} 