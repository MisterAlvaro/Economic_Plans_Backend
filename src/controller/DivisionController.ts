// src/controller/DivisionController.ts
import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { Division } from '../entity/Division';

export class DivisionController {
  static async getAll(req: Request, res: Response) {
    const divisions = await AppDataSource.getRepository(Division).find();
    return res.json(divisions);
  }

  static async create(req: Request, res: Response) {
    const { name, code } = req.body;
    const divisionRepo = AppDataSource.getRepository(Division);

    const existing = await divisionRepo.findOneBy({ code });
    if (existing) return res.status(409).json({ message: 'Division already exists' });

    const division = divisionRepo.create({ name, code });
    await divisionRepo.save(division);
    return res.status(201).json(division);
  }
} 