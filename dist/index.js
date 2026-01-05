"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/index.ts
require("reflect-metadata");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const data_source_1 = require("./data-source");
const routes_1 = __importDefault(require("./routes"));
const InitializationService_1 = require("./services/InitializationService");
const app = (0, express_1.default)();
const PORT = 3001;
app.use((0, cors_1.default)({
    origin: true, // Permite cualquier origen en desarrollo
    credentials: true
}));
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json());
// API routes
app.use('/api', routes_1.default);
data_source_1.AppDataSource.initialize().then(async () => {
    console.log('Connected to database');
    // Inicializar datos por defecto
    await InitializationService_1.InitializationService.initializeDefaultData();
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}).catch(error => console.log(error));
