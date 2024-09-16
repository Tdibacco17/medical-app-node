import conn from "../database/db";
import { v4 as uuidv4 } from 'uuid';

export const RepositorySpecialties = async () => {
    try {
        const query = `SELECT id, description FROM app.specialties;`;
        const { rows: specialties } = await conn.query(query);

        if (specialties.length === 0) return { message: "No se encontraron especialidades.", status: 404 };

        return { message: "Especialidades encontradas con éxito.", status: 200, data: specialties };
    } catch (e: any) {
        return { message: `[Ocurrio un error inesperado]: ${e.message}`, status: 500 };
    }
};

export const RepositoryNewSpecialty = async (description: string) => {
    try {
        const query1 = `SELECT id FROM app.specialties WHERE description = $1;`;
        const { rows: existingSpecialty } = await conn.query(query1, [description]);

        if (existingSpecialty.length > 0) return { message: 'La especialidad ya existe con el nombre proporcionado.', status: 409 };

        const query2 = `INSERT INTO app.specialties(id, description) VALUES ($1, $2) RETURNING *;`

        const { rows: newSpecialty } = await conn.query(query2, [uuidv4(), description]);
        if (newSpecialty.length === 0) throw new Error('Falló la creación.');

        return { message: "Especialidad creada con éxito.", status: 201, };
    } catch (e: any) {
        return { message: `[Ocurrio un error inesperado]: ${e.message}`, status: 500 };
    }
};

export const RepositoryDeleteSpecialtyById = async (id: string) => {
    try {
        const checkAssignmentQuery = `SELECT COUNT(*) AS count FROM app.specialties_doctors WHERE specialty_id = $1;`;
        const { rows: assignmentCheck } = await conn.query(checkAssignmentQuery, [id]);

        const isAssigned = parseInt(assignmentCheck[0].count, 10) > 0;

        if (isAssigned) return { message: 'No se puede eliminar la especialidad porque está asignada a un médico.', status: 400 };

        const deleteQuery = `DELETE FROM app.specialties WHERE id = $1 RETURNING *;`;
        const { rows: deletedSpecialty } = await conn.query(deleteQuery, [id]);

        if (deletedSpecialty.length === 0) return { message: 'Especialidad no encontrada.', status: 404 };

        return { message: 'Especialidad eliminada correctamente.', status: 200 };
    } catch (e: any) {
        return { message: `[Ocurrio un error inesperado]: ${e.message}`, status: 500 };
    }
};