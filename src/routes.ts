// src/routes.ts
import { Router } from 'express';
import multer from 'multer';
import { PlanController } from './controller/PlanController';
import { UserController } from './controller/UserController';
import { DivisionController } from './controller/DivisionController';
import { PlanSheetController } from './controller/PlanSheetController';
import { FormulaCellController } from './controller/FormulaCellController';
import { EconomicIndicatorController } from './controller/EconomicIndicatorController';
import { MasterPlanController } from './controller/MasterPlanController';
import { AIController } from './controller/AIController';
import { authenticateJWT, authorizeRoles } from './middleware/authMiddleware';
import { AuthController } from './controller/AuthController';
import { validateExcelUpload } from './middleware/excelValidator';

// memoryStorage: sin disco (Vercel tiene FS de solo lectura). Funciona también en local.
const upload = multer({ storage: multer.memoryStorage() });
const router = Router();

// Public
router.post('/users', UserController.create); // Registro sin autenticación
router.post('/auth/login', AuthController.login); // Login JWT con cookies
router.post('/auth/refresh', AuthController.refresh); // Refresh Token
router.post('/auth/logout', AuthController.logout); // Logout (blacklist)

// Protected routes
router.use(authenticateJWT);

// Economic Plans
router.get('/plans', authorizeRoles('admin', 'economist'), PlanController.getAll);
router.get('/plans/:id', authorizeRoles('admin', 'economist'), PlanController.getById);
router.post('/plans', authorizeRoles('admin'), PlanController.create);
router.post('/plans/:id/upload', authorizeRoles('admin', 'economist'), upload.single('file'), validateExcelUpload, PlanController.uploadExcel);
router.put('/plans/:id/status', authorizeRoles('admin'), PlanController.updateStatus);
router.delete('/plans/:id', authorizeRoles('admin'), PlanController.delete);

// Master Plans (Annual General Plan)
router.get('/master-plans', authorizeRoles('admin', 'economist'), MasterPlanController.getAll);
router.post('/master-plans', authorizeRoles('admin'), MasterPlanController.create);
router.post('/master-plans/:id/upload', authorizeRoles('admin'), upload.single('file'), validateExcelUpload, MasterPlanController.uploadExcel);
router.get('/master-plans/:id/sheets', authorizeRoles('admin', 'economist'), MasterPlanController.getSheets);

// Users
router.get('/users', authorizeRoles('admin'), UserController.getAll);
router.get('/users/:id', authorizeRoles('admin'), UserController.getById);
router.delete('/users/:id', authorizeRoles('admin'), UserController.delete);

// Divisions
router.get('/divisions', authorizeRoles('admin', 'economist'), DivisionController.getAll);
router.post('/divisions', authorizeRoles('admin'), DivisionController.create);

// Plan Sheets
router.get('/plans/:planId/sheets', authorizeRoles('admin', 'economist'), PlanSheetController.getByPlan);

// Formula Cells
router.get('/sheets/:sheetId/formula-cells', authorizeRoles('admin', 'economist'), FormulaCellController.getBySheet);

// Economic Indicators
router.get('/indicators', authorizeRoles('admin', 'economist'), EconomicIndicatorController.getAll);
router.post('/indicators', authorizeRoles('admin'), EconomicIndicatorController.create);

// AI Assistant (local Ollama)
router.post('/ai/reajustes', authorizeRoles('admin'), AIController.suggestReajustes);
router.get('/ai/reajustes/history/:planId', authorizeRoles('admin'), AIController.getReajustesHistory);

export default router; 