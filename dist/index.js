"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const db_1 = require("./database/db");
const config_1 = require("./utils/config");
const sessions_routes_1 = require("./routes/sessions.routes");
const specialty_routes_1 = require("./routes/specialty.routes");
const doctor_routes_1 = require("./routes/doctor.routes");
const server = (0, express_1.default)();
// Middlewares
server.use(express_1.default.json());
server.use(express_1.default.urlencoded({ extended: false }));
server.use(express_1.default.static('public'));
server.use((0, cors_1.default)());
// Routes
server.use('/api', sessions_routes_1.router);
// server.use('/api', patientsRoutes);
server.use('/api', doctor_routes_1.router);
server.use('/api', specialty_routes_1.router);
// Start server
(() => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const dbConnected = yield (0, db_1.connectDb)();
        if (dbConnected) {
            server.listen(config_1.PORT, () => console.log(`Server is running at http://localhost:${config_1.PORT}/`));
        }
        else {
            console.error('Could not connect to the database. The server will not start');
            return;
        }
    }
    catch (error) {
        console.error('Error connecting to the database: ', error);
        return;
    }
}))();
//# sourceMappingURL=index.js.map