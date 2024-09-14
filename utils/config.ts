export const DB_USER = process.env.DB_USER;
export const DB_HOST = process.env.DB_HOST;
export const DB_PASSWORD = process.env.DB_PASSWORD;
export const DB_DATABASE = process.env.DB_DATABASE;
export const DB_PORT = process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432;

export const JWT_SECRET = process.env.JWT_SECRET;
export const JWT_ALGORITHM = process.env.JWT_ALGORITHM;
export const JWT_EXPIRE = process.env.JWT_EXPIRE;

export const PORT = process.env.PORT;