"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DivisionController = void 0;
const data_source_1 = require("../data-source");
const Division_1 = require("../entity/Division");
class DivisionController {
    static async getAll(req, res) {
        const divisions = await data_source_1.AppDataSource.getRepository(Division_1.Division).find();
        return res.json(divisions);
    }
    static async create(req, res) {
        const { name, code } = req.body;
        const divisionRepo = data_source_1.AppDataSource.getRepository(Division_1.Division);
        const existing = await divisionRepo.findOneBy({ code });
        if (existing)
            return res.status(409).json({ message: 'Division already exists' });
        const division = divisionRepo.create({ name, code });
        await divisionRepo.save(division);
        return res.status(201).json(division);
    }
}
exports.DivisionController = DivisionController;
