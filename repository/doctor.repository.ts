import conn from "../database/db";
import { v4 as uuidv4 } from 'uuid';

export const RepositoryDoctors = async () => {
    try {
        const query = `
        SELECT 
            d.id, 
            d.name, 
            d.lastname, 
            d.dni, 
            d.phone, 
            d.email,
            COALESCE(
                ARRAY_AGG(s.description) FILTER (WHERE s.description IS NOT NULL),
                ARRAY['No specialties assigned']
            ) AS specialty_descriptions
        FROM 
            app.doctors d
        LEFT JOIN 
            app.specialties_doctors sd ON d.id = sd.doctor_id
        LEFT JOIN 
            app.specialties s ON sd.specialty_id = s.id
        GROUP BY 
            d.id, d.name, d.lastname, d.dni, d.phone, d.email;
        `;

        const { rows: doctors } = await conn.query(query);

        if (doctors.length === 0) return { message: "No se encontraron doctores.", status: 404, data: [] };

        return { message: "Doctores encontrados con éxito.", status: 200, data: doctors };
    } catch (e: any) {
        return { message: `[Ocurrio un error inesperado]: ${e.message}`, status: 500, data: [] };
    }
};

export const RepositoryDoctorById = async (id: string) => {
    try {
        const query = `
            SELECT 
                d.id, 
                d.name, 
                d.lastname, 
                d.dni, 
                d.phone, 
                d.email,
                COALESCE(
                    ARRAY_AGG(s.description) FILTER (WHERE s.description IS NOT NULL),
                    ARRAY['No specialties assigned']
                ) AS specialty_descriptions
            FROM 
                app.doctors d
            LEFT JOIN 
                app.specialties_doctors sd ON d.id = sd.doctor_id
            LEFT JOIN 
                app.specialties s ON sd.specialty_id = s.id
            WHERE 
                d.id = $1
            GROUP BY 
                d.id, d.name, d.lastname, d.dni, d.phone, d.email;
        `;

        const { rows: doctors } = await conn.query(query, [id]);

        if (doctors.length === 0) return { message: "Doctor no encontrado.", status: 404, data: [] };

        return { message: "Doctor encontrado con éxito.", status: 200, data: doctors[0] };
    } catch (e: any) {
        return { message: `[Ocurrio un error inesperado]: ${e.message}`, status: 500, data: [] };
    }
};

export const RepositoryNewDoctor = async (name: string, lastname: string, dni: string, phone: string, email: string, specialty_ids: string[]) => {
    try {
        const checkEmailQuery = 'SELECT id FROM app.doctors WHERE email = $1;';
        const { rows: existingDoctor } = await conn.query(checkEmailQuery, [email]);

        if (existingDoctor.length > 0) return { message: 'Ya existe un médico con este correo electrónico.', status: 409 };

        const checkDniQuery = 'SELECT id FROM app.doctors WHERE dni = $1;';
        const { rows: existingDoctorByDni } = await conn.query(checkDniQuery, [dni]);

        if (existingDoctorByDni.length > 0) return { message: 'Ya existe un médico con este DNI.', status: 409 };

        const invalidSpecialties = [];

        for (const specialtyId of specialty_ids) {
            const checkSpecialtyQuery = 'SELECT id FROM app.specialties WHERE id = $1;';
            const { rows: existingSpecialty } = await conn.query(checkSpecialtyQuery, [specialtyId]);
            if (existingSpecialty.length === 0) {
                invalidSpecialties.push(specialtyId);
            }
        }

        if (invalidSpecialties.length > 0) return { message: `Las especialidades con ID ${invalidSpecialties.join(', ')} no existen.`, status: 404 };

        const insertDoctorQuery = `
            INSERT INTO app.doctors (id, name, lastname, dni, phone, email)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *;
        `;

        const values = [uuidv4(), name, lastname, dni, phone, email];

        const { rows: newDoctor } = await conn.query(insertDoctorQuery, values);
        if (newDoctor.length === 0) throw new Error('Falló la creación.');

        const insertSpecialtyDoctorQuery = `
        INSERT INTO app.specialties_doctors (specialty_id, doctor_id)
        VALUES ($1, $2);
        `;

        const { id } = newDoctor[0]

        for (const specialtyId of specialty_ids) {
            const assignSpecialtyValues = [specialtyId, id];
            const { rowCount: assignSpecialtyResult } = await conn.query(insertSpecialtyDoctorQuery, assignSpecialtyValues);

            if (assignSpecialtyResult === 0) console.warn(`La asignación de ID de especialidad ${specialtyId} no insertó ninguna fila.`);
        }

        return { message: 'Doctor creado con éxito.', status: 201, };
    } catch (e: any) {
        return { message: `[Ocurrio un error inesperado]: ${e.message}`, status: 500 };
    }
};

export const RepositoryUpdateDoctorById = async (id: string, name: string, lastname: string, dni: string, phone: string, email: string, specialty_ids: string[]) => {
    try {
        const checkDoctorQuery = 'SELECT id FROM app.doctors WHERE id = $1;';
        const { rows: existingDoctor } = await conn.query(checkDoctorQuery, [id]);

        if (existingDoctor.length === 0) return { message: "Doctor no encontrado.", status: 404 };

        const updateDoctorQuery = `
            UPDATE app.doctors
            SET name = $1, lastname = $2, dni = $3, phone = $4, email = $5
            WHERE id = $6;
            `;
        const updateValues = [name, lastname, dni, phone, email, id];
        const { rowCount: updateRowCount } = await conn.query(updateDoctorQuery, updateValues);

        if (updateRowCount === 0) throw new Error("La actualización del médico falló.")

        const deleteSpecialtiesQuery = 'DELETE FROM app.specialties_doctors WHERE doctor_id = $1;';
        await conn.query(deleteSpecialtiesQuery, [id]);

        const invalidSpecialties: string[] = [];

        const checkSpecialtyQuery = 'SELECT id FROM app.specialties WHERE id = $1;';

        for (const specialtyId of specialty_ids) {
            const { rows: existingSpecialty } = await conn.query(checkSpecialtyQuery, [specialtyId]);
            if (existingSpecialty.length === 0) {
                invalidSpecialties.push(specialtyId);
            }
        }

        if (invalidSpecialties.length > 0) return { message: `Las especialidades con ID ${invalidSpecialties.join(', ')} no existen.`, status: 404 };

        const insertSpecialtyDoctorQuery = `
        INSERT INTO app.specialties_doctors (specialty_id, doctor_id)
        VALUES ($1, $2);
        `;

        for (const specialtyId of specialty_ids) {
            const assignSpecialtyValues = [specialtyId, id];
            const { rowCount: assignSpecialtyResult } = await conn.query(insertSpecialtyDoctorQuery, assignSpecialtyValues);

            if (assignSpecialtyResult === 0) console.warn(`La asignación de ID de especialidad ${specialtyId} no insertó ninguna fila.`);
        }

        return { message: 'Doctor actualizado con éxito.', status: 200 };
    } catch (e: any) {
        return { message: `[Ocurrio un error inesperado]: ${e.message}`, status: 500 };
    }
};

export const RepositoryDeleteDoctorById = async (id: string) => {
    try {
        const deleteQuery = `DELETE FROM app.doctors WHERE id = $1 RETURNING *;`;
        const { rows: deletedDoctor } = await conn.query(deleteQuery, [id]);

        if (deletedDoctor.length === 0) return { message: 'Doctor no encontrado.', status: 404 };

        return { message: 'Doctor elminado con éxito.', status: 200 };
    } catch (e: any) {
        return { message: `[Ocurrio un error inesperado]: ${e.message}`, status: 500 };
    }
};