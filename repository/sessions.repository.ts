import conn from "../database/db";
import { JwtPayload } from "../types";
import { compare, encrypt } from "../utils/bcrypt";
import { tokenSign, verifyToken } from "../utils/jwt";
import { v4 as uuidv4 } from 'uuid';

// verifyToken
export const RepositorySessions = async (email: string, password: string) => {
    try {
        const query = `SELECT id, email, password FROM app.users WHERE email = $1;`
        const { rows: userRows } = await conn.query(query, [email]);

        if (userRows.length === 0) return { message: "Invalid credentials.", status: 401 };

        const { id, password: userPassword } = userRows[0];

        const passwordMatch = await compare(password, userPassword);

        if (!passwordMatch) return { message: "Invalid credentials.", status: 400 };

        const permissionsQuery = `SELECT permission_id FROM app.users_permissions WHERE user_id = $1;`;
        const { rows: permissionsRows } = await conn.query(permissionsQuery, [id]);

        if (permissionsRows.length === 0) return { message: 'No permissions found for the user.', status: 403 };

        const permissions = permissionsRows.map(row => row.permission_id);

        const tokenResponse = tokenSign({
            email: email,
            roles: permissions
        });

        if (tokenResponse.status && tokenResponse.status !== 200) return tokenResponse;

        return {
            message: "Login successful.", status: 200,
            data: {
                email: email,
                token: tokenResponse.data,
                roles: permissions
            }
        };
    } catch (e: any) {
        return { message: `[Internal Server Error]: ${e.message}`, status: 500 };
    }
};

export const RepositoryRefresh = async (token: string) => {
    try {
        const decodedTokenResponse = verifyToken(token);

        if (decodedTokenResponse.status && decodedTokenResponse.status !== 200) return decodedTokenResponse;
        const { email } = decodedTokenResponse.data as JwtPayload;

        const query = `SELECT id FROM app.users WHERE email = $1;`
        const { rows: userRows } = await conn.query(query, [email]);

        if (userRows.length === 0) return { message: "User not found.", status: 401 };

        const { id } = userRows[0]

        const permissionsQuery = `SELECT permission_id FROM app.users_permissions WHERE user_id = $1;`;
        const { rows: permissionsRows } = await conn.query(permissionsQuery, [id]);

        if (permissionsRows.length === 0) return { message: "No permissions found for the user.", status: 403 };

        const permissions = permissionsRows.map(row => row.permission_id);

        const tokenRefreshResponse = tokenSign({
            email: email,
            roles: permissions
        });
        if (tokenRefreshResponse.status && tokenRefreshResponse.status !== 200) return tokenRefreshResponse;

        return {
            message: "Token refreshed successfully.",
            status: 200,
            data: {
                email: email,
                token: tokenRefreshResponse.data,
                roles: permissions
            }
        };
    } catch (e: any) {
        return { message: `[Internal Server Error]: ${e.message}`, status: 500 };
    }
};

export const RepositoryCreateUser = async (email: string, password: string) => {
    try {
        const checkUserQuery = `SELECT id FROM app.users WHERE email = $1;`;
        const { rows: existingUser } = await conn.query(checkUserQuery, [email]);

        if (existingUser.length > 0) return { message: 'User already exists with the provided email.', status: 409 };

        const query = `INSERT INTO app.users(id, email, password) VALUES ($1, $2, $3) RETURNING *;`

        const hashedPassword = await encrypt(password);

        const values = [uuidv4(), email, hashedPassword];

        const { rows: userCreate } = await conn.query(query, values);
        if (userCreate.length === 0) throw new Error('User creation failed.');

        const newUserId = userCreate[0].id;
        const roleId = 'C';

        const assignRoleQuery = `INSERT INTO app.users_permissions(user_id, permission_id)
            VALUES ($1, $2) ON CONFLICT (user_id, permission_id) DO NOTHING;`;

        const assignRoleValues = [newUserId, roleId];
        const { rowCount: assignRoleResult } = await conn.query(assignRoleQuery, assignRoleValues);
        if (assignRoleResult === 0) console.warn('Role assignment did not insert any rows. This may indicate the role was already assigned.');

        return { message: `User created successfully.`, status: 200, data: userCreate[0] };
    } catch (e: any) {
        return { message: `[Internal Server Error]: ${e.message}`, status: 500 };
    }
}