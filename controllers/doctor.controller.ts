import { Request, Response } from "express";
import { ParseResponseInterface } from "../types";
import { RepositoryDeleteDoctorById, RepositoryDoctorById, RepositoryDoctors, RepositoryNewDoctor, RepositoryUpdateDoctorById } from "../repository/doctor.repository";
import { emailRegex, uuidV4Regex } from "../utils/regex";

export const GetDoctors = async (req: Request, res: Response<ParseResponseInterface>) => {
    try {
        const response = await RepositoryDoctors();
        return res.status(200).json(response);
    } catch (e: any) {
        return res.status(500).json({ message: `[Internal Server Error]: ${e.message}`, status: 500 });
    }
};

export const GetDoctorById = async (req: Request, res: Response<ParseResponseInterface>) => {
    try {
        const { id } = req.params;

        if (!id) return res.status(401).json({ message: "Id not provided.", status: 401 });
        if (!uuidV4Regex.test(id)) return res.status(400).json({ message: "Invalid ID format. Must be a valid UUID v4.", status: 400 });

        const response = await RepositoryDoctorById(id);
        return res.status(200).json(response);
    } catch (e: any) {
        return res.status(500).json({ message: `[Internal Server Error]: ${e.message}`, status: 500 });
    }
};

export const CreateNewDoctor = async (req: Request, res: Response<ParseResponseInterface>) => {
    try {
        const { name, lastname, dni, phone, email, specialty_ids } = req.body;

        if (!name || !lastname || !dni || !phone || !email) return res.status(401).json({ message: "All fields are required.", status: 401 });
        if (!emailRegex.test(email)) return res.status(400).json({ message: "Invalid email format.", status: 400 });
        if (!specialty_ids || !Array.isArray(specialty_ids) || specialty_ids.length === 0) return res.status(401).json({ message: "SpecialtyIds array not provided or empty.", status: 401 });
        if (specialty_ids.some((id: string) => !uuidV4Regex.test(id))) return res.status(400).json({ message: "Invalid specialtyId format. All IDs must be valid UUID v4.", status: 400 });

        const uniqueSpecialtyIds = Array.from(new Set(specialty_ids));

        const response = await RepositoryNewDoctor(name, lastname, dni, phone, email, uniqueSpecialtyIds);
        return res.status(200).json(response);
    } catch (e: any) {
        return res.status(500).json({ message: `[Internal Server Error]: ${e.message}`, status: 500 });
    }
};

export const UpdateDoctorById = async (req: Request, res: Response<ParseResponseInterface>) => {
    try {
        const { id } = req.params;
        const { name, lastname, dni, phone, email, specialty_ids } = req.body;

        if (!id) return res.status(401).json({ message: "Id not provided.", status: 401 });
        if (!uuidV4Regex.test(id)) return res.status(400).json({ message: "Invalid ID format. Must be a valid UUID v4.", status: 400 });
        if (!name || !lastname || !dni || !phone || !email) return res.status(401).json({ message: "All fields are required.", status: 401 });
        if (!emailRegex.test(email)) return res.status(400).json({ message: "Invalid email format.", status: 400 });
        if (!specialty_ids || !Array.isArray(specialty_ids) || specialty_ids.length === 0) return res.status(401).json({ message: "SpecialtyIds array not provided or empty.", status: 401 });
        if (specialty_ids.some((id: string) => !uuidV4Regex.test(id))) return res.status(400).json({ message: "Invalid specialtyId format. All IDs must be valid UUID v4.", status: 400 });

        const uniqueSpecialtyIds = Array.from(new Set(specialty_ids));

        const response = await RepositoryUpdateDoctorById(id, name, lastname, dni, phone, email, uniqueSpecialtyIds);
        return res.status(200).json(response);
    } catch (e: any) {
        return res.status(500).json({ message: `[Internal Server Error]: ${e.message}`, status: 500 });
    }
};

export const DeleteDoctorById = async (req: Request, res: Response<ParseResponseInterface>) => {
    try {
        const { id } = req.params;

        if (!id) return res.status(401).json({ message: "Id not provided.", status: 401 });
        if (!uuidV4Regex.test(id)) return res.status(400).json({ message: "Invalid ID format. Must be a valid UUID v4.", status: 400 });

        const response = await RepositoryDeleteDoctorById(id);
        return res.status(200).json(response);
    } catch (e: any) {
        return res.status(500).json({ message: `[Internal Server Error]: ${e.message}`, status: 500 });
    }
};