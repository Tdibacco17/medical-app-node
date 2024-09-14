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
exports.repositoryCreate = exports.repositoryRefresh = exports.repositorySessions = void 0;
const db_1 = __importDefault(require("../database/db"));
const bcrypt_1 = require("../utils/bcrypt");
const jwt_1 = require("../utils/jwt");
const uuid_1 = require("uuid");
// verifyToken
const repositorySessions = (email, password) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const query = `SELECT id, email, password FROM app.users WHERE email = $1;`;
        const { rows: userRows } = yield db_1.default.query(query, [email]);
        if (userRows.length === 0)
            return { message: "Invalid credentials.", status: 401 };
        const { id, password: userPassword } = userRows[0];
        const passwordMatch = yield (0, bcrypt_1.compare)(password, userPassword);
        if (!passwordMatch)
            return { message: "Invalid credentials.", status: 400 };
        const permissionsQuery = `SELECT permission_id FROM app.users_permissions WHERE user_id = $1;`;
        const { rows: permissionsRows } = yield db_1.default.query(permissionsQuery, [id]);
        if (permissionsRows.length === 0)
            return { message: 'No permissions found for the user.', status: 403 };
        const permissions = permissionsRows.map(row => row.permission_id);
        const tokenResponse = (0, jwt_1.tokenSign)({
            email: email,
            roles: permissions
        });
        if (tokenResponse.status && tokenResponse.status !== 200)
            return tokenResponse;
        return {
            message: "Login successful", status: 200,
            data: {
                email: email,
                token: tokenResponse.data,
                roles: permissions
            }
        };
    }
    catch (e) {
        return { message: `[Internal Server Error]: ${e.message}`, status: 500 };
    }
});
exports.repositorySessions = repositorySessions;
const repositoryRefresh = (token) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const decodedTokenResponse = (0, jwt_1.verifyToken)(token);
        if (decodedTokenResponse.status && decodedTokenResponse.status !== 200)
            return decodedTokenResponse;
        const { email } = decodedTokenResponse.data;
        const query = `SELECT id FROM app.users WHERE email = $1;`;
        const { rows: userRows } = yield db_1.default.query(query, [email]);
        if (userRows.length === 0)
            return { message: "User not found.", status: 401 };
        const { id } = userRows[0];
        const permissionsQuery = `SELECT permission_id FROM app.users_permissions WHERE user_id = $1;`;
        const { rows: permissionsRows } = yield db_1.default.query(permissionsQuery, [id]);
        if (permissionsRows.length === 0)
            return { message: "No permissions found for the user.", status: 403 };
        const permissions = permissionsRows.map(row => row.permission_id);
        const tokenRefreshResponse = (0, jwt_1.tokenSign)({
            email: email,
            roles: permissions
        });
        if (tokenRefreshResponse.status && tokenRefreshResponse.status !== 200)
            return tokenRefreshResponse;
        return {
            message: "Token refreshed successfully",
            status: 200,
            data: {
                email: email,
                token: tokenRefreshResponse.data,
                roles: permissions
            }
        };
    }
    catch (e) {
        return { message: `[Internal Server Error]: ${e.message}`, status: 500 };
    }
});
exports.repositoryRefresh = repositoryRefresh;
const repositoryCreate = (email, password) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const checkUserQuery = `SELECT id FROM app.users WHERE email = $1;`;
        const { rows: existingUser } = yield db_1.default.query(checkUserQuery, [email]);
        if (existingUser.length > 0)
            return { message: 'User already exists with the provided email.', status: 400 };
        const query = `INSERT INTO app.users(id, email, password) VALUES ($1, $2, $3) RETURNING *;`;
        const hashedPassword = yield (0, bcrypt_1.encrypt)(password);
        const values = [(0, uuid_1.v4)(), email, hashedPassword];
        const { rows: userCreate } = yield db_1.default.query(query, values);
        if (userCreate.length === 0)
            throw new Error('User creation failed.');
        const newUserId = userCreate[0].id;
        const roleId = 'C';
        const assignRoleQuery = `INSERT INTO app.users_permissions(user_id, permission_id)
            VALUES ($1, $2) ON CONFLICT (user_id, permission_id) DO NOTHING;`;
        const assignRoleValues = [newUserId, roleId];
        const { rowCount: assignRoleResult } = yield db_1.default.query(assignRoleQuery, assignRoleValues);
        if (assignRoleResult === 0)
            console.warn('Role assignment did not insert any rows. This may indicate the role was already assigned.');
        return userCreate[0];
    }
    catch (e) {
        return { message: `[Internal Server Error]: ${e.message}`, status: 500 };
    }
});
exports.repositoryCreate = repositoryCreate;
//# sourceMappingURL=sessions.repository.js.map