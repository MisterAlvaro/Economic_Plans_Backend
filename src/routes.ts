// src/routes.ts
import { Router } from 'express';
import multer from 'multer';
import { PlanController } from './controller/PlanController';
import { UserController } from './controller/UserController';
import { DivisionController } from './controller/DivisionController';
import { PlanSheetController } from './controller/PlanSheetController';
import { FormulaCellController } from './controller/FormulaCellController';
import { EconomicIndicatorController } from './controller/EconomicIndicatorController';
import { authenticateJWT } from './middleware/authMiddleware';
import { AuthController } from './controller/AuthController';
import { validateExcelUpload } from './middleware/excelValidator';

const upload = multer({ dest: 'uploads/' });
const router = Router();

// Public
router.post('/users', UserController.create); // Registro sin autenticación
router.post('/auth/login', AuthController.login); // Login JWT con cookies
router.post('/auth/refresh', AuthController.refresh); // Refresh Token
router.post('/auth/logout', AuthController.logout); // Logout (blacklist)

// Protected routes
router.use(authenticateJWT);

// Economic Plans
router.get('/plans', PlanController.getAll);
router.get('/plans/:id', PlanController.getById);
router.post('/plans', PlanController.create);
router.post('/plans/:id/upload', upload.single('file'), validateExcelUpload, PlanController.uploadExcel);
router.put('/plans/:id/status', PlanController.updateStatus);
router.delete('/plans/:id', PlanController.delete);

// Users
router.get('/users', UserController.getAll);
router.get('/users/:id', UserController.getById);

// Divisions
router.get('/divisions', DivisionController.getAll);
router.post('/divisions', DivisionController.create);

// Plan Sheets
router.get('/plans/:planId/sheets', PlanSheetController.getByPlan);

// Formula Cells
router.get('/sheets/:sheetId/formula-cells', FormulaCellController.getBySheet);

// Economic Indicators
router.get('/indicators', EconomicIndicatorController.getAll);
router.post('/indicators', EconomicIndicatorController.create);

export default router; 