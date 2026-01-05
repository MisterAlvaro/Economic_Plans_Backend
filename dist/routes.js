"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes.ts
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const PlanController_1 = require("./controller/PlanController");
const UserController_1 = require("./controller/UserController");
const DivisionController_1 = require("./controller/DivisionController");
const PlanSheetController_1 = require("./controller/PlanSheetController");
const FormulaCellController_1 = require("./controller/FormulaCellController");
const EconomicIndicatorController_1 = require("./controller/EconomicIndicatorController");
const authMiddleware_1 = require("./middleware/authMiddleware");
const AuthController_1 = require("./controller/AuthController");
const excelValidator_1 = require("./middleware/excelValidator");
const upload = (0, multer_1.default)({ dest: 'uploads/' });
const router = (0, express_1.Router)();
// Public
router.post('/users', UserController_1.UserController.create); // Registro sin autenticación
router.post('/auth/login', AuthController_1.AuthController.login); // Login JWT con cookies
router.post('/auth/refresh', AuthController_1.AuthController.refresh); // Refresh Token
router.post('/auth/logout', AuthController_1.AuthController.logout); // Logout (blacklist)
// Protected routes
router.use(authMiddleware_1.authenticateJWT);
// Economic Plans
router.get('/plans', PlanController_1.PlanController.getAll);
router.get('/plans/:id', PlanController_1.PlanController.getById);
router.post('/plans', PlanController_1.PlanController.create);
router.post('/plans/:id/upload', upload.single('file'), excelValidator_1.validateExcelUpload, PlanController_1.PlanController.uploadExcel);
router.put('/plans/:id/status', PlanController_1.PlanController.updateStatus);
router.delete('/plans/:id', PlanController_1.PlanController.delete);
// Users
router.get('/users', UserController_1.UserController.getAll);
router.get('/users/:id', UserController_1.UserController.getById);
// Divisions
router.get('/divisions', DivisionController_1.DivisionController.getAll);
router.post('/divisions', DivisionController_1.DivisionController.create);
// Plan Sheets
router.get('/plans/:planId/sheets', PlanSheetController_1.PlanSheetController.getByPlan);
// Formula Cells
router.get('/sheets/:sheetId/formula-cells', FormulaCellController_1.FormulaCellController.getBySheet);
// Economic Indicators
router.get('/indicators', EconomicIndicatorController_1.EconomicIndicatorController.getAll);
router.post('/indicators', EconomicIndicatorController_1.EconomicIndicatorController.create);
exports.default = router;
