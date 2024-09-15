import 'dotenv/config'
import express from 'express';
import cors from "cors";
import { connectDb } from './database/db';
import { PORT } from './utils/config';
import { router as sessionsRoutes } from "./routes/sessions.routes";
import { router as specialitesRoutes } from "./routes/specialty.routes";
import { router as doctorsRoutes } from "./routes/doctor.routes";

const server = express();

// Middlewares
server.use(express.json());
server.use(express.urlencoded({ extended: false }));
server.use(express.static('public'))
server.use(cors());

// Routes
server.use('/api', sessionsRoutes);
// server.use('/api', patientsRoutes);
server.use('/api', doctorsRoutes);
server.use('/api', specialitesRoutes);

// Start server
(async () => {
    try {
        const dbConnected = await connectDb();

        if (dbConnected) {
            server.listen(PORT, () => console.log(`Server is running at http://localhost:${PORT}/`));
        } else {
            console.error('Could not connect to the database. The server will not start');
            return;
        }
    } catch (error) {
        console.error('Error connecting to the database: ', error);
        return;
    }
})();