"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FormulaCellController = void 0;
const data_source_1 = require("../data-source");
const FormulaCell_1 = require("../entity/FormulaCell");
class FormulaCellController {
    static async getBySheet(req, res) {
        const sheetId = parseInt(req.params.sheetId);
        const cells = await data_source_1.AppDataSource.getRepository(FormulaCell_1.FormulaCell).find({
            where: { sheet: { id: sheetId } }
        });
        return res.json(cells);
    }
}
exports.FormulaCellController = FormulaCellController;
