import conn from "../database/db";
import { v4 as uuidv4 } from 'uuid';

export const RepositorySpecialties = async () => {
    try {
        const query = `SELECT id, description FROM app.specialties;`;
        const { rows: specialties } = await conn.query(query);

        if (specialties.length === 0) return { message: "No specialties found.", status: 404 };

        return { message: "Specialties successfully.", status: 200, data: specialties };
    } catch (e: any) {
        return { message: `[Internal Server Error]: ${e.message}`, status: 500 };
    }
};

export const RepositoryNewSpecialty = async (description: string) => {
    try {
        const query1 = `SELECT id FROM app.specialties WHERE description = $1;`;
        const { rows: existingSpecialty } = await conn.query(query1, [description]);

        if (existingSpecialty.length > 0) return { message: 'Specilaty already exists with the provided description.', status: 409 };

        const query2 = `INSERT INTO app.specialties(id, description) VALUES ($1, $2) RETURNING *;`

        const { rows: newSpecialty } = await conn.query(query2, [uuidv4(), description]);
        if (newSpecialty.length === 0) throw new Error('Specialty creation failed.');

        return {
            message: "Specialty created successfully.",
            status: 201,
            data: newSpecialty[0],
        };
    } catch (e: any) {
        return { message: `[Internal Server Error]: ${e.message}`, status: 500 };
    }
};

export const RepositoryDeleteSpecialtyById = async (id: string) => {
    try {
        const checkAssignmentQuery = `SELECT COUNT(*) AS count FROM app.specialties_doctors WHERE specialty_id = $1;`;
        const { rows: assignmentCheck } = await conn.query(checkAssignmentQuery, [id]);

        const isAssigned = parseInt(assignmentCheck[0].count, 10) > 0;

        if (isAssigned) return { message: 'Cannot delete specialty because it is assigned to a doctor.', status: 400 };

        const deleteQuery = `DELETE FROM app.specialties WHERE id = $1 RETURNING *;`;
        const { rows: deletedSpecialty } = await conn.query(deleteQuery, [id]);

        if (deletedSpecialty.length === 0) return { message: 'Specialty not found.', status: 404 };

        return { message: 'Specialty deleted successfully.', status: 200 };
    } catch (e: any) {
        return { message: `[Internal Server Error]: ${e.message}`, status: 500 };
    }
};