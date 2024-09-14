
export interface ParseResponseInterface {
    message: string;
    status: number;
    data?: any
}

// jsonwebtoken types
export interface JwtPayload {
    email: string;
    roles: string[];
}

export interface TokenResponse {
    message: string;
    status: number;
    data?: string | JwtPayload;
}

declare global {
    namespace Express {
        interface Request {
            user?: JwtPayload;
        }
    }
}