"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlanController = void 0;
const data_source_1 = require("../data-source");
const EconomicPlans_1 = require("../entity/EconomicPlans");
const Division_1 = require("../entity/Division");
const User_1 = require("../entity/User");
const ExcelProcessor_1 = require("../services/ExcelProcessor");
const fs_1 = __importDefault(require("fs"));
class PlanController {
    static async getAll(req, res) {
        const plans = await data_source_1.AppDataSource.getRepository(EconomicPlans_1.EconomicPlan).find({
            relations: ['division', 'created_by', 'reviewed_by', 'approved_by'],
            order: { year: 'DESC' }
        });
        return res.json(plans);
    }
    static async getById(req, res) {
        const { id } = req.params;
        const plan = await data_source_1.AppDataSource.getRepository(EconomicPlans_1.EconomicPlan).findOne({
            where: { id: parseInt(id) },
            relations: ['division', 'created_by', 'reviewed_by', 'approved_by', 'sheets']
        });
        if (!plan)
            return res.status(404).json({ message: 'Plan not found' });
        return res.json(plan);
    }
    static async create(req, res) {
        const { divisionId, year, createdBy } = req.body;
        const division = await data_source_1.AppDataSource.getRepository(Division_1.Division).findOneBy({ id: divisionId });
        const user = await data_source_1.AppDataSource.getRepository(User_1.User).findOneBy({ id: createdBy });
        if (!division || !user) {
            return res.status(400).json({ message: 'Invalid division or user' });
        }
        const existing = await data_source_1.AppDataSource.getRepository(EconomicPlans_1.EconomicPlan).findOneBy({ division: { id: divisionId }, year });
        if (existing) {
            return res.status(409).json({ message: 'Plan already exists for this division and year' });
        }
        const plan = data_source_1.AppDataSource.getRepository(EconomicPlans_1.EconomicPlan).create({
            division,
            year,
            created_by: user,
            version: 1,
            status: 'draft',
        });
        await data_source_1.AppDataSource.getRepository(EconomicPlans_1.EconomicPlan).save(plan);
        return res.status(201).json(plan);
    }
    static async uploadExcel(req, res) {
        const { id } = req.params;
        const planId = parseInt(id);
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        // Verificar que el plan existe
        const planRepo = data_source_1.AppDataSource.getRepository(EconomicPlans_1.EconomicPlan);
        const plan = await planRepo.findOneBy({ id: planId });
        if (!plan) {
            return res.status(404).json({ message: 'Plan not found' });
        }
        try {
            const fileBuffer = fs_1.default.readFileSync(req.file.path);
            await ExcelProcessor_1.ExcelProcessor.process(fileBuffer, planId);
            // Clean up uploaded file
            fs_1.default.unlinkSync(req.file.path);
            res.json({
                message: 'Excel processed successfully',
                planId,
                sheetsProcessed: true
            });
        }
        catch (error) {
            // Clean up uploaded file on error
            if (req.file && fs_1.default.existsSync(req.file.path)) {
                fs_1.default.unlinkSync(req.file.path);
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
    static async updateStatus(req, res) {
        const { id } = req.params;
        const { status } = req.body;
        const allowed = ['draft', 'reviewed', 'approved'];
        if (!allowed.includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }
        const planRepo = data_source_1.AppDataSource.getRepository(EconomicPlans_1.EconomicPlan);
        const plan = await planRepo.findOneBy({ id: parseInt(id) });
        if (!plan)
            return res.status(404).json({ message: 'Plan not found' });
        plan.status = status;
        await planRepo.save(plan);
        return res.json({ message: 'Status updated', plan });
    }
    static async delete(req, res) {
        const { id } = req.params;
        const repo = data_source_1.AppDataSource.getRepository(EconomicPlans_1.EconomicPlan);
        const plan = await repo.findOneBy({ id: parseInt(id) });
        if (!plan)
            return res.status(404).json({ message: 'Plan not found' });
        await repo.remove(plan);
        return res.json({ message: 'Plan deleted' });
    }
}
exports.PlanController = PlanController;
