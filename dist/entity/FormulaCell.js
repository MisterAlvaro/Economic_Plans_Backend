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
exports.FormulaCell = void 0;
const typeorm_1 = require("typeorm");
const PlanSheets_1 = require("./PlanSheets");
let FormulaCell = class FormulaCell {
};
exports.FormulaCell = FormulaCell;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], FormulaCell.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => PlanSheets_1.PlanSheet, sheet => sheet.formulaCells, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'sheet_id' }),
    __metadata("design:type", PlanSheets_1.PlanSheet)
], FormulaCell.prototype, "sheet", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "cell_reference" }),
    __metadata("design:type", String)
], FormulaCell.prototype, "cellReference", void 0);
__decorate([
    (0, typeorm_1.Column)('text'),
    __metadata("design:type", String)
], FormulaCell.prototype, "formula", void 0);
__decorate([
    (0, typeorm_1.Column)('text', { array: true }),
    __metadata("design:type", Array)
], FormulaCell.prototype, "depends_on", void 0);
__decorate([
    (0, typeorm_1.Column)('numeric', { precision: 15, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], FormulaCell.prototype, "last_value", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamptz', nullable: true }),
    __metadata("design:type", Date)
], FormulaCell.prototype, "last_calculated_at", void 0);
exports.FormulaCell = FormulaCell = __decorate([
    (0, typeorm_1.Entity)('formula_cells')
], FormulaCell);
