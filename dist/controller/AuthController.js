"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const data_source_1 = require("../data-source");
const User_1 = require("../entity/User");
const RevokedToken_1 = require("../entity/RevokedToken");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || 'secretkey';
class AuthController {
    static async login(req, res) {
        const { email, password } = req.body;
        const userRepo = data_source_1.AppDataSource.getRepository(User_1.User);
        const user = await userRepo.findOne({ where: { email }, relations: ['division'] });
        if (!user || !user.is_active)
            return res.status(401).json({ message: 'Invalid credentials' });
        const passwordValid = await bcrypt_1.default.compare(password, user.passwordHash);
        if (!passwordValid)
            return res.status(401).json({ message: 'Invalid credentials' });
        const payload = { id: user.id, email: user.email, role: user.role, divisionId: user.division.id };
        const token = jsonwebtoken_1.default.sign(payload, JWT_SECRET, { expiresIn: '8h' });
        const refreshToken = jsonwebtoken_1.default.sign(payload, JWT_SECRET, { expiresIn: '7d' });
        res
            .cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 8 * 60 * 60 * 1000
        })
            .json({ refreshToken, user });
    }
    static async refresh(req, res) {
        const { refreshToken } = req.body;
        if (!refreshToken)
            return res.status(400).json({ message: 'Refresh token is required' });
        try {
            const decoded = jsonwebtoken_1.default.verify(refreshToken, JWT_SECRET);
            // Remover propiedades de tiempo del payload decodificado
            const { iat, exp, ...payload } = decoded;
            const newToken = jsonwebtoken_1.default.sign(payload, JWT_SECRET, { expiresIn: '8h' });
            res.cookie('token', newToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 8 * 60 * 60 * 1000
            });
            return res.json({ token: newToken });
        }
        catch (err) {
            return res.status(403).json({ message: 'Invalid refresh token' });
        }
    }
    static async logout(req, res) {
        var _a, _b;
        const token = ((_a = req.cookies) === null || _a === void 0 ? void 0 : _a.token) || ((_b = req.headers.authorization) === null || _b === void 0 ? void 0 : _b.split(' ')[1]);
        if (token) {
            const decoded = jsonwebtoken_1.default.decode(token);
            const expiresAt = new Date(decoded.exp * 1000);
            const revokedRepo = data_source_1.AppDataSource.getRepository(RevokedToken_1.RevokedToken);
            const record = revokedRepo.create({ token, expiresAt });
            await revokedRepo.save(record);
        }
        res.clearCookie('token');
        return res.json({ message: 'Logged out successfully' });
    }
}
exports.AuthController = AuthController;
