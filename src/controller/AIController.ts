import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { AIReajusteHistory } from '../entity/AIReajusteHistory';
import { EconomicPlan } from '../entity/EconomicPlans';
import { User } from '../entity/User';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { OllamaService, ReajusteAnalysisInput } from '../services/OllamaService';

interface ReajusteRequestBody {
  planId: number;
  masterPlanYear: number;
  divisionPlanYear: number;
  divisionName: string;
  missingSheets: string[];
  extraSheets: string[];
  matchedSheets: string[];
  requiresPonderamiento: boolean;
}

export class AIController {
  static async suggestReajustes(req: AuthenticatedRequest, res: Response) {
    try {
      const {
        planId,
        masterPlanYear,
        divisionPlanYear,
        divisionName,
        missingSheets,
        extraSheets,
        matchedSheets,
        requiresPonderamiento,
      } = req.body as ReajusteRequestBody;

      if (!planId || !masterPlanYear || !divisionPlanYear || !divisionName) {
        return res.status(400).json({ message: 'Missing required context fields for AI analysis' });
      }

      const planRepo = AppDataSource.getRepository(EconomicPlan);
      const plan = await planRepo.findOne({ where: { id: Number(planId) } });
      if (!plan) {
        return res.status(404).json({ message: 'Plan not found' });
      }

      const payload: ReajusteAnalysisInput = {
        masterPlanYear: Number(masterPlanYear),
        divisionPlanYear: Number(divisionPlanYear),
        divisionName,
        missingSheets: Array.isArray(missingSheets) ? missingSheets : [],
        extraSheets: Array.isArray(extraSheets) ? extraSheets : [],
        matchedSheets: Array.isArray(matchedSheets) ? matchedSheets : [],
        requiresPonderamiento: Boolean(requiresPonderamiento),
      };

      const result = await OllamaService.analyzeReajuste(payload);

      const historyRepo = AppDataSource.getRepository(AIReajusteHistory);
      const userRepo = AppDataSource.getRepository(User);
      const requestedById = req.user?.id;
      const requestedBy = requestedById
        ? await userRepo.findOne({ where: { id: Number(requestedById) } })
        : null;

      const historyRecord = historyRepo.create({
        plan,
        requested_by: requestedBy || null,
        model_name: result.model,
        context: payload,
        recommendation: result.recommendation,
      });
      await historyRepo.save(historyRecord);

      return res.json(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown AI service error';
      return res.status(502).json({
        message: 'No se pudo obtener respuesta del modelo local (Ollama). Verifica que esté ejecutándose.',
        detail: message,
      });
    }
  }

  static async getReajustesHistory(req: Request, res: Response) {
    const planId = Number(req.params.planId);
    if (Number.isNaN(planId)) {
      return res.status(400).json({ message: 'Invalid plan id' });
    }

    const history = await AppDataSource.getRepository(AIReajusteHistory).find({
      where: { plan: { id: planId } },
      relations: ['requested_by', 'plan'],
      order: { created_at: 'DESC' },
    });

    return res.json(history);
  }
}
