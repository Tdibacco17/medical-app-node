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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Create = exports.RefreshToken = exports.Login = void 0;
const sessions_repository_1 = require("../repository/sessions.repository");
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const Login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        if (!email || !password)
            return res.status(401).json({ message: "Email or password not provided.", status: 401 });
        const response = yield (0, sessions_repository_1.repositorySessions)(email, password);
        return res.status(200).json(response);
    }
    catch (e) {
        return res.status(500).json({ message: `[Internal Server Error]: ${e.message}`, status: 500 });
    }
});
exports.Login = Login;
const RefreshToken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { token } = req.body;
        if (!token)
            return res.status(401).json({ message: "Empty token", status: 401 });
        const response = yield (0, sessions_repository_1.repositoryRefresh)(token);
        return res.status(200).json(response);
    }
    catch (e) {
        return { message: `[Internal Server Error]: ${e.message}`, status: 500 };
    }
});
exports.RefreshToken = RefreshToken;
const Create = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        if (!email || !password)
            return res.status(401).json({ message: "Email or password not provided.", status: 401 });
        if (!emailRegex.test(email))
            return res.status(400).json({ message: "Invalid email format.", status: 400 });
        const response = yield (0, sessions_repository_1.repositoryCreate)(email, password);
        return res.status(200).json(response);
    }
    catch (e) {
        return res.status(500).json({ message: `[Internal Server Error]: ${e.message}`, status: 500 });
    }
});
exports.Create = Create;
//# sourceMappingURL=sessions.controller.js.map