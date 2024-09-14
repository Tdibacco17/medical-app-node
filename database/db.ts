import pg from "pg";
import { DB_DATABASE, DB_HOST, DB_PASSWORD, DB_PORT, DB_USER } from "../utils/config";

const conn = new pg.Pool({
    host: DB_HOST,
    database: DB_DATABASE,
    user: DB_USER,
    password: DB_PASSWORD,
    port: DB_PORT,
});

export const connectDb = async () => {
    try {
        const client = await conn.connect();
        console.log('Connected to PostgreSQL');
        client.release();
        return true;
    } catch (error) {
        console.error('Failed to connect to PostgreSQL:', error);
        return false;
    }
};

export default conn;