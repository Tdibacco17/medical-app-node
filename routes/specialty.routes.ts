import { Router } from "express";
import { CreateNewSpecialty, DeleteSpecialtyById, GetSpecialties } from "../controllers/specialty.controller";
import { verifyBearerToken, verifyUserPermissions } from "../middlewares/authMiddleware";

export const router = Router();

router.post("/specialty", verifyBearerToken, verifyUserPermissions, CreateNewSpecialty);
router.get("/specialties", verifyBearerToken, verifyUserPermissions, GetSpecialties);
router.delete("/specialty/:id", verifyBearerToken, verifyUserPermissions, DeleteSpecialtyById);