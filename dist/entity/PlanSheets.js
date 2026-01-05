"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlanSheet = void 0;
const typeorm_1 = require("typeorm");
const EconomicPlans_1 = require("./EconomicPlans");
const FormulaCell_1 = require("./FormulaCell");
let PlanSheet = class PlanSheet {
};
exports.PlanSheet = PlanSheet;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], PlanSheet.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => EconomicPlans_1.EconomicPlan, plan => plan.sheets, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'plan_id' }),
    __metadata("design:type", EconomicPlans_1.EconomicPlan)
], PlanSheet.prototype, "plan", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "sheet_name", length: 50 }),
    __metadata("design:type", String)
], PlanSheet.prototype, "sheetName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb' }),
    __metadata("design:type", Object)
], PlanSheet.prototype, "data", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => FormulaCell_1.FormulaCell, cell => cell.sheet),
    __metadata("design:type", Array)
], PlanSheet.prototype, "formulaCells", void 0);
exports.PlanSheet = PlanSheet = __decorate([
    (0, typeorm_1.Entity)('plan_sheets'),
    (0, typeorm_1.Unique)(['plan', 'sheetName'])
], PlanSheet);
