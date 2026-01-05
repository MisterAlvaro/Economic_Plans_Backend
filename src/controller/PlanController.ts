// src/controller/PlanController.ts
import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { EconomicPlan } from '../entity/EconomicPlans';
import { Division } from '../entity/Division';
import { User } from '../entity/User';
import { ExcelProcessor } from '../services/ExcelProcessor';
import fs from 'fs';

interface FileUploadRequest extends Request {
  file?: Express.Multer.File;
}

export class PlanController {
  static async getAll(req: Request, res: Response) {
    const plans = await AppDataSource.getRepository(EconomicPlan).find({
      relations: ['division', 'created_by', 'reviewed_by', 'approved_by'],
      order: { year: 'DESC' }
    });
    return res.json(plans);
  }

  static async getById(req: Request, res: Response) {
    const { id } = req.params;
    const plan = await AppDataSource.getRepository(EconomicPlan).findOne({
      where: { id: parseInt(id) },
      relations: ['division', 'created_by', 'reviewed_by', 'approved_by', 'sheets']
    });
    if (!plan) return res.status(404).json({ message: 'Plan not found' });
    return res.json(plan);
  }

  static async create(req: Request, res: Response) {
    const { divisionId, year, createdBy } = req.body;

    const division = await AppDataSource.getRepository(Division).findOneBy({ id: divisionId });
    const user = await AppDataSource.getRepository(User).findOneBy({ id: createdBy });

    if (!division || !user) {
      return res.status(400).json({ message: 'Invalid division or user' });
    }

    const existing = await AppDataSource.getRepository(EconomicPlan).findOneBy({ division: { id: divisionId }, year });
    if (existing) {
      return res.status(409).json({ message: 'Plan already exists for this division and year' });
    }

    const plan = AppDataSource.getRepository(EconomicPlan).create({
      division,
      year,
      created_by: user,
      version: 1,
      status: 'draft',
    });

    await AppDataSource.getRepository(EconomicPlan).save(plan);
    return res.status(201).json(plan);
  }

  static async uploadExcel(req: FileUploadRequest, res: Response) {
    const { id } = req.params;
    const planId = parseInt(id);

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Verificar que el plan existe
    const planRepo = AppDataSource.getRepository(EconomicPlan);
    const plan = await planRepo.findOneBy({ id: planId });
    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }

    try {
      const fileBuffer = fs.readFileSync(req.file.path);
      await ExcelProcessor.process(fileBuffer, planId);
      
      // Clean up uploaded file
      fs.unlinkSync(req.file.path);
      
      res.json({ 
        message: 'Excel processed successfully',
        planId,
        sheetsProcessed: true
      });
    } catch (error) {
      // Clean up uploaded file on error
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      
      console.error('Error processing Excel:', error);
      
      // Manejo específico de errores
      if (error instanceof Error) {
        if (error.message.includes('QueryFailedError')) {
          return res.status(400).json({ 
            message: 'Database error while processing Excel',
            error: 'Invalid data format or constraint violation'
          });
        }
        if (error.message.includes('ENOENT')) {
          return res.status(400).json({ 
            message: 'File not found or corrupted'
          });
        }
      }
      
      res.status(500).json({ 
        message: 'Error processing Excel file',
        error: 'Internal server error'
      });
    }
  }

  static async updateStatus(req: Request, res: Response) {
    const { id } = req.params;
    const { status } = req.body;

    const allowed = ['draft', 'reviewed', 'approved'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const planRepo = AppDataSource.getRepository(EconomicPlan);
    const plan = await planRepo.findOneBy({ id: parseInt(id) });
    if (!plan) return res.status(404).json({ message: 'Plan not found' });

    plan.status = status;
    await planRepo.save(plan);

    return res.json({ message: 'Status updated', plan });
  }

  static async delete(req: Request, res: Response) {
    const { id } = req.params;
    const repo = AppDataSource.getRepository(EconomicPlan);
    const plan = await repo.findOneBy({ id: parseInt(id) });
    if (!plan) return res.status(404).json({ message: 'Plan not found' });

    await repo.remove(plan);
    return res.json({ message: 'Plan deleted' });
  }
}
