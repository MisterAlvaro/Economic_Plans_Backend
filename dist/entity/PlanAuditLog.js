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
exports.PlanAuditLog = void 0;
const typeorm_1 = require("typeorm");
const EconomicPlans_1 = require("./EconomicPlans");
const User_1 = require("./User");
let PlanAuditLog = class PlanAuditLog {
};
exports.PlanAuditLog = PlanAuditLog;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], PlanAuditLog.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => EconomicPlans_1.EconomicPlan, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'plan_id' }),
    __metadata("design:type", EconomicPlans_1.EconomicPlan)
], PlanAuditLog.prototype, "plan", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", User_1.User)
], PlanAuditLog.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], PlanAuditLog.prototype, "action", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'changed_table', nullable: true }),
    __metadata("design:type", String)
], PlanAuditLog.prototype, "changedTable", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'changed_field', nullable: true }),
    __metadata("design:type", String)
], PlanAuditLog.prototype, "changedField", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'old_value', nullable: true, type: 'text' }),
    __metadata("design:type", String)
], PlanAuditLog.prototype, "oldValue", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'new_value', nullable: true, type: 'text' }),
    __metadata("design:type", String)
], PlanAuditLog.prototype, "newValue", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ip_address', length: 45, nullable: true }),
    __metadata("design:type", String)
], PlanAuditLog.prototype, "ipAddress", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamptz' }),
    __metadata("design:type", Date)
], PlanAuditLog.prototype, "created_at", void 0);
exports.PlanAuditLog = PlanAuditLog = __decorate([
    (0, typeorm_1.Entity)('plan_audit_log')
], PlanAuditLog);
