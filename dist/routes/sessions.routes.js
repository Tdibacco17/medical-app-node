"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = require("express");
const sessions_controller_1 = require("../controllers/sessions.controller");
exports.router = (0, express_1.Router)();
exports.router.post("/login", sessions_controller_1.Login);
exports.router.post("/refreshToken", sessions_controller_1.RefreshToken);
exports.router.post("/create", sessions_controller_1.CreateUser);
//# sourceMappingURL=sessions.routes.js.map