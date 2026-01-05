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
exports.EconomicPlan = void 0;
const typeorm_1 = require("typeorm");
const Division_1 = require("./Division");
const User_1 = require("./User");
const PlanSheets_1 = require("./PlanSheets");
let EconomicPlan = class EconomicPlan {
};
exports.EconomicPlan = EconomicPlan;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], EconomicPlan.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Division_1.Division, division => division.plans, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'division_id' }),
    __metadata("design:type", Division_1.Division)
], EconomicPlan.prototype, "division", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], EconomicPlan.prototype, "year", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 1 }),
    __metadata("design:type", Number)
], EconomicPlan.prototype, "version", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], EconomicPlan.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'created_by' }),
    __metadata("design:type", User_1.User)
], EconomicPlan.prototype, "created_by", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User, { nullable: true, onDelete: 'SET NULL' }),
    (0, typeorm_1.JoinColumn)({ name: 'reviewed_by' }),
    __metadata("design:type", User_1.User)
], EconomicPlan.prototype, "reviewed_by", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User, { nullable: true, onDelete: 'SET NULL' }),
    (0, typeorm_1.JoinColumn)({ name: 'approved_by' }),
    __metadata("design:type", User_1.User)
], EconomicPlan.prototype, "approved_by", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamptz' }),
    __metadata("design:type", Date)
], EconomicPlan.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ type: 'timestamptz', nullable: true }),
    __metadata("design:type", Date)
], EconomicPlan.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => PlanSheets_1.PlanSheet, sheet => sheet.plan),
    __metadata("design:type", Array)
], EconomicPlan.prototype, "sheets", void 0);
exports.EconomicPlan = EconomicPlan = __decorate([
    (0, typeorm_1.Entity)('economic_plans')
], EconomicPlan);
