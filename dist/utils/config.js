"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PORT = exports.JWT_EXPIRE = exports.JWT_ALGORITHM = exports.JWT_SECRET = exports.DB_PORT = exports.DB_DATABASE = exports.DB_PASSWORD = exports.DB_HOST = exports.DB_USER = void 0;
exports.DB_USER = process.env.DB_USER;
exports.DB_HOST = process.env.DB_HOST;
exports.DB_PASSWORD = process.env.DB_PASSWORD;
exports.DB_DATABASE = process.env.DB_DATABASE;
exports.DB_PORT = process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432;
exports.JWT_SECRET = process.env.JWT_SECRET;
exports.JWT_ALGORITHM = process.env.JWT_ALGORITHM;
exports.JWT_EXPIRE = process.env.JWT_EXPIRE;
exports.PORT = process.env.PORT;
//# sourceMappingURL=config.js.map