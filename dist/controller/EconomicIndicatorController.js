"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EconomicIndicatorController = void 0;
const data_source_1 = require("../data-source");
const EconomicIndicator_1 = require("../entity/EconomicIndicator");
class EconomicIndicatorController {
    static async getAll(req, res) {
        const indicators = await data_source_1.AppDataSource.getRepository(EconomicIndicator_1.EconomicIndicator).find();
        return res.json(indicators);
    }
    static async create(req, res) {
        const { name, code, unit, description, formulaTemplate } = req.body;
        const indicatorRepo = data_source_1.AppDataSource.getRepository(EconomicIndicator_1.EconomicIndicator);
        const indicator = indicatorRepo.create({ name, code, unit, description, formulaTemplate });
        await indicatorRepo.save(indicator);
        return res.status(201).json(indicator);
    }
}
exports.EconomicIndicatorController = EconomicIndicatorController;
