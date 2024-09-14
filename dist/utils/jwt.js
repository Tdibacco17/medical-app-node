"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = exports.tokenSign = void 0;
const config_1 = require("./config");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const tokenSign = (data) => {
    if (!config_1.JWT_SECRET || !config_1.JWT_ALGORITHM || !config_1.JWT_EXPIRE) {
        return { message: "JWT_SECRET, JWT_ALGORITHM or JWT_EXPIRE falta de configuracion.", status: 500 };
    }
    try {
        const token = jsonwebtoken_1.default.sign(Object.assign({}, data), config_1.JWT_SECRET, {
            algorithm: config_1.JWT_ALGORITHM,
            expiresIn: config_1.JWT_EXPIRE,
        });
        return { message: 'Token created successfully', data: token, status: 200 };
    }
    catch (e) {
        return { message: `Failed to create token: ${e.message}`, status: 500 };
    }
};
exports.tokenSign = tokenSign;
const verifyToken = (token) => {
    if (!config_1.JWT_SECRET) {
        return { message: "JWT_SECRET falta de configuración.", status: 500 };
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, config_1.JWT_SECRET);
        return { message: 'Token decoded successfully', data: decoded, status: 200 };
    }
    catch (e) {
        return { message: `Failed to decode token: ${e.message}`, status: 500 };
    }
};
exports.verifyToken = verifyToken;
//# sourceMappingURL=jwt.js.map