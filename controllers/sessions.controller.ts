import { Request, Response } from "express";
import { ParseResponseInterface } from "../types";
import { RepositoryCreateUser, RepositorySessions, RepositoryRefresh } from "../repository/sessions.repository";
import { emailRegex } from "../utils/regex";

export const Login = async (req: Request, res: Response<ParseResponseInterface>) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) return res.status(401).json({ message: "Correo electrónico o contraseña no proporcionados.", status: 401 });

    const response: ParseResponseInterface = await RepositorySessions(email, password);
    return res.status(200).json(response);
  } catch (e: any) {
    return res.status(500).json({ message: `[Error interno del servidor]: ${e.message}`, status: 500 });
  }
};

export const RefreshToken = async (req: Request, res: Response<ParseResponseInterface>) => {
  try {
    const { token } = req.body;
    
    if (!token) return res.status(401).json({ message: "Token no proporcionado.", status: 401 });

    const response: ParseResponseInterface = await RepositoryRefresh(token);
    return res.status(200).json(response);
  } catch (e: any) {
    return { message: `[Error interno del servidor]: ${e.message}`, status: 500 };
  }
};

export const CreateUser = async (req: Request, res: Response<ParseResponseInterface>) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) return res.status(401).json({ message: "Correo electrónico o contraseña no proporcionados.", status: 401 });
    if (!emailRegex.test(email)) return res.status(400).json({ message: "Formato email no valido.", status: 400 });

    const response: ParseResponseInterface = await RepositoryCreateUser(email, password);
    return res.status(200).json(response);
  } catch (e: any) {
    return res.status(500).json({ message: `[Error interno del servidor]: ${e.message}`, status: 500 });
  }
};