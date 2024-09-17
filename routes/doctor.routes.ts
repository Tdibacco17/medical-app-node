import { Router } from "express";
import { verifyBearerToken, verifyUserPermissions } from "../middlewares/authMiddleware";
import { GetDoctors, CreateNewDoctor, DeleteDoctorById, UpdateDoctorById } from "../controllers/doctor.controller";

export const router = Router();

router.get("/doctors", verifyBearerToken, verifyUserPermissions, GetDoctors);
// router.get("/doctor/:id", verifyBearerToken, verifyUserPermissions, GetDoctorById);
router.post("/doctor", verifyBearerToken, verifyUserPermissions, CreateNewDoctor);
router.put("/doctor/:id", verifyBearerToken, verifyUserPermissions, UpdateDoctorById);
router.delete("/doctor/:id", verifyBearerToken, verifyUserPermissions, DeleteDoctorById);
