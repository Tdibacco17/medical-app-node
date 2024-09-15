import { Request, Response, NextFunction } from "express";
import { JWT_SECRET } from "../utils/config";
import { verifyToken } from "../utils/jwt";
import { JwtPayload, ParseResponseInterface } from "../types";

// Auth Middleware
export const verifyBearerToken = (req: Request, res: Response<ParseResponseInterface>, next: NextFunction) => {
    try {
        const token = req.header("Authorization")?.replace("Bearer ", "");

        if (!token) return res.status(401).json({ message: "Access token not provided", status: 401 });
        if (!JWT_SECRET) return res.status(500).json({ message: "JWT_SECRET is missing in the environment configuration", status: 500 });

        const response = verifyToken(token);

        if (response.status !== 200) return res.status(response.status).json(response);

        req.user = response.data as JwtPayload;
        return next();
    } catch (e) {
        return res.status(403).json({ message: "Unauthorized", status: 403 });
    }
};

// Permissions Middleware
export const verifyUserPermissions = (req: Request, res: Response<ParseResponseInterface>, next: NextFunction) => {
    try {
        if (!req.user) return res.status(401).json({ message: "Access token not provided", status: 401 });

        const { roles } = req.user;
        if (!roles || !roles.includes('A')) return res.status(403).json({ message: "Forbidden: Insufficient permissions", status: 403 });

        return next();
    } catch (e) {
        return res.status(403).json({ message: "Unauthorized", status: 403 });
    }
}