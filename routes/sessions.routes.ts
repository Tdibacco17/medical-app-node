import { Router } from "express";
import { CreateUser, Login, RefreshToken } from "../controllers/sessions.controller";

export const router = Router();

router.post("/login", Login);
router.post("/refreshToken", RefreshToken);
router.post("/create", CreateUser);
