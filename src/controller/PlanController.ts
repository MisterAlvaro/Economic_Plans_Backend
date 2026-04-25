// src/controller/PlanController.ts
import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { EconomicPlan } from '../entity/EconomicPlans';
import { Division } from '../entity/Division';
import { MasterPlan } from '../entity/MasterPlan';
import { User } from '../entity/User';
import { ExcelProcessor } from '../services/ExcelProcessor';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

interface FileUploadRequest extends AuthenticatedRequest {
  file?: Express.Multer.File & { buffer?: Buffer };
}

export class PlanController {
  static async getAll(req: AuthenticatedRequest, res: Response) {
    const role = req.user?.role;
    const divisionId = req.user?.divisionId;

    const whereClause = role === 'economist' && divisionId
      ? { division: { id: Number(divisionId) } }
      : {};

    const plans = await AppDataSource.getRepository(EconomicPlan).find({
      where: whereClause,
      relations: ['division', 'master_plan', 'created_by', 'reviewed_by', 'approved_by'],
      order: { year: 'DESC' }
    });
    return res.json(plans);
  }

  static async getById(req: AuthenticatedRequest, res: Response) {
    const { id } = req.params;
    const role = req.user?.role;
    const divisionId = req.user?.divisionId;

    const plan = await AppDataSource.getRepository(EconomicPlan).findOne({
      where: { id: parseInt(id) },
      relations: ['division', 'master_plan', 'created_by', 'reviewed_by', 'approved_by', 'sheets']
    });
    if (!plan) return res.status(404).json({ message: 'Plan not found' });

    if (role === 'economist' && Number(plan.division?.id) !== Number(divisionId)) {
      return res.status(403).json({ message: 'Insufficient permissions for this division plan' });
    }

    return res.json(plan);
  }

  static async create(req: AuthenticatedRequest, res: Response) {
    const { divisionId, year, masterPlanId } = req.body;
    const createdBy = req.user?.id;

    const division = await AppDataSource.getRepository(Division).findOneBy({ id: divisionId });
    const masterPlan = await AppDataSource.getRepository(MasterPlan).findOneBy({ id: masterPlanId });
    const user = await AppDataSource.getRepository(User).findOneBy({ id: createdBy });

    if (!division || !user || !masterPlan) {
      return res.status(400).json({ message: 'Invalid division, master plan or user' });
    }

    if (Number(masterPlan.year) !== Number(year)) {
      return res.status(400).json({ message: 'Plan year must match selected master plan year' });
    }

    const existing = await AppDataSource.getRepository(EconomicPlan).findOneBy({ division: { id: divisionId }, year });
    if (existing) {
      return res.status(409).json({ message: 'Plan already exists for this division and year' });
    }

    const plan = AppDataSource.getRepository(EconomicPlan).create({
      division,
      master_plan: masterPlan,
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
    const role = req.user?.role;
    const divisionId = req.user?.divisionId;

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Verificar que el plan existe
    const planRepo = AppDataSource.getRepository(EconomicPlan);
    const plan = await planRepo.findOne({ where: { id: planId }, relations: ['division'] });
    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }

    if (role === 'economist' && Number(plan.division?.id) !== Number(divisionId)) {
      return res.status(403).json({ message: 'Insufficient permissions for this division plan' });
    }

    try {
      const fileBuffer = req.file.buffer;
      if (!fileBuffer || !fileBuffer.length) {
        return res.status(400).json({ message: 'No file uploaded or empty file' });
      }
      const sheetsProcessed = await ExcelProcessor.process(fileBuffer, planId);
      
      res.json({ 
        message: 'Excel processed successfully',
        planId,
        sheetsProcessed
      });
    } catch (error) {
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
