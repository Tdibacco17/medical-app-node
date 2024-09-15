import { JwtPayload, TokenResponse } from "../types";
import { JWT_SECRET, JWT_ALGORITHM, JWT_EXPIRE } from "./config";
import jwt, { Algorithm } from "jsonwebtoken";

export const tokenSign = (data: JwtPayload): TokenResponse => {
    if (!JWT_SECRET || !JWT_ALGORITHM || !JWT_EXPIRE) {
        return { message: "JWT_SECRET, JWT_ALGORITHM o JWT_EXPIRE falta de configuracion.", status: 500 };
    }
    try {

        const token = jwt.sign({ ...data }, JWT_SECRET, {
            algorithm: JWT_ALGORITHM as Algorithm,
            expiresIn: JWT_EXPIRE,
        }
        );
        return { message: 'Token creado con éxito.', data: token, status: 200 }
    } catch (e: any) {
        return { message: `Fallo la creación del token: ${e.message}`, status: 500 };
    }
};

export const verifyToken = (token: string): TokenResponse => {
    if (!JWT_SECRET) {
        return { message: "JWT_SECRET falta de configuración.", status: 500 };
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
        return { message: 'Token decodificado con éxito.', data: decoded, status: 200 };
    } catch (e: any) {
        return { message: `Fallo la decodificacíon del token: ${e.message}`, status: 500 };
    }
};