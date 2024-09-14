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
exports.connectDb = void 0;
const pg_1 = __importDefault(require("pg"));
const config_1 = require("../utils/config");
const conn = new pg_1.default.Pool({
    host: config_1.DB_HOST,
    database: config_1.DB_DATABASE,
    user: config_1.DB_USER,
    password: config_1.DB_PASSWORD,
    port: config_1.DB_PORT,
});
const connectDb = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const client = yield conn.connect();
        console.log('Connected to PostgreSQL');
        client.release();
        return true;
    }
    catch (error) {
        console.error('Failed to connect to PostgreSQL:', error);
        return false;
    }
});
exports.connectDb = connectDb;
exports.default = conn;
//# sourceMappingURL=db.js.map