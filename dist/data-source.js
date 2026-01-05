"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
const typeorm_1 = require("typeorm");
const ormconfig_json_1 = __importDefault(require("../ormconfig.json"));
exports.AppDataSource = new typeorm_1.DataSource(ormconfig_json_1.default);
