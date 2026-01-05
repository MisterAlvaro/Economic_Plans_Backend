"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlanSheetController = void 0;
const data_source_1 = require("../data-source");
const PlanSheets_1 = require("../entity/PlanSheets");
class PlanSheetController {
    static async getByPlan(req, res) {
        const planId = parseInt(req.params.planId);
        const sheets = await data_source_1.AppDataSource.getRepository(PlanSheets_1.PlanSheet).find({
            where: { plan: { id: planId } },
            relations: ['plan']
        });
        return res.json(sheets);
    }
}
exports.PlanSheetController = PlanSheetController;
