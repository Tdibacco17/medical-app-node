"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyUserPermissions = exports.verifyBearerToken = void 0;
const config_1 = require("../utils/config");
const jwt_js_1 = require("../utils/jwt.js");
// Auth Middleware
const verifyBearerToken = (req, res, next) => {
    var _a;
    try {
        const token = (_a = req.header("Authorization")) === null || _a === void 0 ? void 0 : _a.replace("Bearer ", "");
        if (!token) {
            return res.status(401).json({ message: "Access token not provided", status: 401 });
        }
        if (!config_1.JWT_SECRET) {
            return res.status(500).json({ message: "JWT_SECRET is missing in the environment configuration", status: 500 });
        }
        const response = (0, jwt_js_1.verifyToken)(token);
        if (response.status !== 200) {
            return res.status(response.status).json(response);
        }
        req.user = response.data;
        return next();
    }
    catch (e) {
        return res.status(403).json({ message: "Unauthorized", status: 403 });
    }
};
exports.verifyBearerToken = verifyBearerToken;
// Permissions Middleware
const verifyUserPermissions = (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Access token not provided", status: 401 });
        }
        const { profile } = req.user;
        if (profile.includes('Admin') ||
            profile.includes('read_Pacientes') ||
            profile.includes('write_Pacientes')) {
            return next();
        }
        else {
            return res.status(403).json({ message: "Forbidden: Insufficient permissions", status: 403 });
        }
    }
    catch (e) {
        return res.status(403).json({ message: "Unauthorized", status: 403 });
    }
};
exports.verifyUserPermissions = verifyUserPermissions;
//# sourceMappingURL=authMiddleware.js.map