import { Request, Response } from 'express';
import * as XLSX from 'xlsx';
import { AppDataSource } from '../data-source';
import { MasterPlan } from '../entity/MasterPlan';
import { User } from '../entity/User';
import { MasterPlanSheet } from '../entity/MasterPlanSheet';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

interface FileUploadRequest extends AuthenticatedRequest {
  file?: Express.Multer.File & { buffer?: Buffer };
}

export class MasterPlanController {
  static async getAll(req: Request, res: Response) {
    const plans = await AppDataSource.getRepository(MasterPlan).find({
      relations: ['created_by'],
      order: { year: 'DESC' },
    });

    return res.json(plans);
  }

  static async create(req: AuthenticatedRequest, res: Response) {
    const { year } = req.body;
    const createdBy = req.user?.id;

    if (!year || Number.isNaN(Number(year))) {
      return res.status(400).json({ message: 'Year is required' });
    }

    const masterPlanRepo = AppDataSource.getRepository(MasterPlan);
    const userRepo = AppDataSource.getRepository(User);

    const existing = await masterPlanRepo.findOne({ where: { year: Number(year) } });
    if (existing) {
      return res.status(409).json({ message: 'Master plan already exists for this year' });
    }

    const creator = await userRepo.findOne({ where: { id: Number(createdBy) } });
    if (!creator) {
      return res.status(400).json({ message: 'Invalid creator user' });
    }

    const plan = masterPlanRepo.create({
      year: Number(year),
      status: 'draft',
      created_by: creator,
    });

    await masterPlanRepo.save(plan);
    return res.status(201).json(plan);
  }

  static async uploadExcel(req: FileUploadRequest, res: Response) {
    const masterPlanId = Number(req.params.id);

    if (!req.file?.buffer?.length) {
      return res.status(400).json({ message: 'No file uploaded or empty file' });
    }

    const masterPlanRepo = AppDataSource.getRepository(MasterPlan);
    const sheetRepo = AppDataSource.getRepository(MasterPlanSheet);

    const masterPlan = await masterPlanRepo.findOne({ where: { id: masterPlanId } });
    if (!masterPlan) {
      return res.status(404).json({ message: 'Master plan not found' });
    }

    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetNames = workbook.SheetNames || [];

    await sheetRepo
      .createQueryBuilder()
      .delete()
      .from(MasterPlanSheet)
      .where('master_plan_id = :masterPlanId', { masterPlanId })
      .execute();

    for (const sheetName of sheetNames) {
      const worksheet = workbook.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: null });

      const sheet = sheetRepo.create({
        master_plan: masterPlan,
        sheet_name: sheetName,
        data: rows,
      });

      await sheetRepo.save(sheet);
    }

    masterPlan.file_name = req.file.originalname;
    masterPlan.status = 'active';
    await masterPlanRepo.save(masterPlan);

    return res.json({
      message: 'Master plan Excel processed successfully',
      masterPlanId,
      sheetsProcessed: sheetNames.length,
    });
  }

  static async getSheets(req: Request, res: Response) {
    const masterPlanId = Number(req.params.id);

    const sheets = await AppDataSource.getRepository(MasterPlanSheet).find({
      where: { master_plan: { id: masterPlanId } },
      relations: ['master_plan'],
      order: { sheet_name: 'ASC' },
    });

    return res.json(sheets);
  }
}
