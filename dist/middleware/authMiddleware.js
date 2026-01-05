"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateJWT = authenticateJWT;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const data_source_1 = require("../data-source");
const RevokedToken_1 = require("../entity/RevokedToken");
const JWT_SECRET = process.env.JWT_SECRET || 'secretkey';
async function authenticateJWT(req, res, next) {
    var _a, _b;
    const token = ((_a = req.cookies) === null || _a === void 0 ? void 0 : _a.token) || ((_b = req.headers.authorization) === null || _b === void 0 ? void 0 : _b.split(' ')[1]);
    if (!token)
        return res.status(401).json({ message: 'Missing token' });
    const revokedRepo = data_source_1.AppDataSource.getRepository(RevokedToken_1.RevokedToken);
    const revoked = await revokedRepo.findOneBy({ token });
    if (revoked)
        return res.status(401).json({ message: 'Token has been revoked' });
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch (err) {
        return res.status(403).json({ message: 'Invalid or expired token' });
    }
}
