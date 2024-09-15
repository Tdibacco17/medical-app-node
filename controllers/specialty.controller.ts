import { Request, Response } from "express";
import { ParseResponseInterface } from "../types";
import { RepositoryDeleteSpecialtyById, RepositoryNewSpecialty, RepositorySpecialties } from "../repository/specialty.repository";
import { uuidV4Regex } from "../utils/regex";

export const GetSpecialties = async (req: Request, res: Response<ParseResponseInterface>) => {
    try {
        const response = await RepositorySpecialties();
        return res.status(200).json(response);
    } catch (e: any) {
        return res.status(500).json({ message: `[Internal Server Error]: ${e.message}`, status: 500 });
    }
};

export const CreateNewSpecialty = async (req: Request, res: Response<ParseResponseInterface>) => {
    try {
        const { description } = req.body;
        
        if (!description) return res.status(401).json({ message: "Description not provided.", status: 401 });

        const response = await RepositoryNewSpecialty(description);
        return res.status(200).json(response);
    } catch (e: any) {
        return res.status(500).json({ message: `[Internal Server Error]: ${e.message}`, status: 500 });
    }
};

export const DeleteSpecialtyById = async (req: Request, res: Response<ParseResponseInterface>) => {
    try {
        const { id } = req.params;

        if (!id) return res.status(401).json({ message: "Id not provided.", status: 401 });
        if (!uuidV4Regex.test(id)) return res.status(400).json({ message: "Invalid ID format. Must be a valid UUID v4.", status: 400 });

        const response = await RepositoryDeleteSpecialtyById(id);
        return res.status(200).json(response);
    } catch (e: any) {
        return res.status(500).json({ message: `[Internal Server Error]: ${e.message}`, status: 500 });
    }
};
