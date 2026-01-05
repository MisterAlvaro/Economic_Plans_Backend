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
exports.Division = void 0;
const typeorm_1 = require("typeorm");
const User_1 = require("./User");
const EconomicPlans_1 = require("./EconomicPlans");
let Division = class Division {
};
exports.Division = Division;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Division.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, unique: true }),
    __metadata("design:type", String)
], Division.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 10, unique: true, nullable: true }),
    __metadata("design:type", String)
], Division.prototype, "code", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamptz' }),
    __metadata("design:type", Date)
], Division.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => User_1.User, user => user.division),
    __metadata("design:type", Array)
], Division.prototype, "users", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => EconomicPlans_1.EconomicPlan, plan => plan.division),
    __metadata("design:type", Array)
], Division.prototype, "plans", void 0);
exports.Division = Division = __decorate([
    (0, typeorm_1.Entity)('divisions')
], Division);
