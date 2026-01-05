"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const data_source_1 = require("../data-source");
const User_1 = require("../entity/User");
const bcrypt_1 = __importDefault(require("bcrypt"));
class UserController {
    static async getAll(req, res) {
        const users = await data_source_1.AppDataSource.getRepository(User_1.User).find({ relations: ['division'] });
        return res.json(users);
    }
    static async getById(req, res) {
        const user = await data_source_1.AppDataSource.getRepository(User_1.User).findOne({
            where: { id: parseInt(req.params.id) },
            relations: ['division']
        });
        if (!user)
            return res.status(404).json({ message: 'User not found' });
        return res.json(user);
    }
    static async create(req, res) {
        const userRepo = data_source_1.AppDataSource.getRepository(User_1.User);
        const { email, fullName, password, divisionId, role } = req.body;
        // Hash de la contraseña
        const saltRounds = 10;
        const passwordHash = await bcrypt_1.default.hash(password, saltRounds);
        const user = userRepo.create({ email, fullName, passwordHash, role, division: { id: divisionId } });
        await userRepo.save(user);
        return res.status(201).json(user);
    }
}
exports.UserController = UserController;
