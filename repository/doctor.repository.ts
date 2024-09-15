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

        if (doctors.length === 0) return { message: "No doctors found.", status: 404 };

        return { message: "Doctors successfully.", status: 200, data: doctors };
    } catch (e: any) {
        return { message: `[Internal Server Error]: ${e.message}`, status: 500 };
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

        if (doctors.length === 0) return { message: "Doctor not found.", status: 404 };

        return { message: "Doctor retrieved successfully.", status: 200, data: doctors[0] };
    } catch (e: any) {
        return { message: `[Internal Server Error]: ${e.message}`, status: 500 };
    }
};

export const RepositoryNewDoctor = async (name: string, lastname: string, dni: string, phone: string, email: string, specialty_ids: string[]) => {
    try {
        const checkEmailQuery = 'SELECT id FROM app.doctors WHERE email = $1;';
        const { rows: existingDoctor } = await conn.query(checkEmailQuery, [email]);

        if (existingDoctor.length > 0) return { message: 'A doctor with this email already exists.', status: 409 };

        const checkDniQuery = 'SELECT id FROM app.doctors WHERE dni = $1;';
        const { rows: existingDoctorByDni } = await conn.query(checkDniQuery, [dni]);

        if (existingDoctorByDni.length > 0) return { message: 'A doctor with this DNI already exists.', status: 409 };

        const invalidSpecialties = [];

        for (const specialtyId of specialty_ids) {
            const checkSpecialtyQuery = 'SELECT id FROM app.specialties WHERE id = $1;';
            const { rows: existingSpecialty } = await conn.query(checkSpecialtyQuery, [specialtyId]);
            if (existingSpecialty.length === 0) {
                invalidSpecialties.push(specialtyId);
            }
        }

        if (invalidSpecialties.length > 0) return { message: `Specialties with IDs ${invalidSpecialties.join(', ')} do not exist.`, status: 404 };

        const insertDoctorQuery = `
            INSERT INTO app.doctors (id, name, lastname, dni, phone, email)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *;
        `;

        const values = [uuidv4(), name, lastname, dni, phone, email];

        const { rows: newDoctor } = await conn.query(insertDoctorQuery, values);
        if (newDoctor.length === 0) throw new Error('Doctor creation failed.');

        const insertSpecialtyDoctorQuery = `
        INSERT INTO app.specialties_doctors (specialty_id, doctor_id)
        VALUES ($1, $2);
        `;

        const { id } = newDoctor[0]

        for (const specialtyId of specialty_ids) {
            const assignSpecialtyValues = [specialtyId, id];
            const { rowCount: assignSpecialtyResult } = await conn.query(insertSpecialtyDoctorQuery, assignSpecialtyValues);

            if (assignSpecialtyResult === 0) console.warn(`Specialty ID ${specialtyId} assignment did not insert any rows. This may indicate the specialty was already assigned.`);
        }

        return { message: 'Doctor created successfully.', status: 201, };
    } catch (e: any) {
        return { message: `[Internal Server Error]: ${e.message}`, status: 500 };
    }
};

export const RepositoryUpdateDoctorById = async (id: string, name: string, lastname: string, dni: string, phone: string, email: string, specialty_ids: string[]) => {
    try {
        const checkDoctorQuery = 'SELECT id FROM app.doctors WHERE id = $1;';
        const { rows: existingDoctor } = await conn.query(checkDoctorQuery, [id]);

        if (existingDoctor.length === 0) return { message: "Doctor not found.", status: 404 };

        const updateDoctorQuery = `
            UPDATE app.doctors
            SET name = $1, lastname = $2, dni = $3, phone = $4, email = $5
            WHERE id = $6;
            `;
        const updateValues = [name, lastname, dni, phone, email, id];
        const { rowCount: updateRowCount } = await conn.query(updateDoctorQuery, updateValues);

        if (updateRowCount === 0) throw new Error("Doctor update failed. No rows affected.")

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

        if (invalidSpecialties.length > 0) return { message: `Specialties with IDs ${invalidSpecialties.join(', ')} do not exist.`, status: 404 };

        const insertSpecialtyDoctorQuery = `
        INSERT INTO app.specialties_doctors (specialty_id, doctor_id)
        VALUES ($1, $2);
        `;

        for (const specialtyId of specialty_ids) {
            const assignSpecialtyValues = [specialtyId, id];
            const { rowCount: assignSpecialtyResult } = await conn.query(insertSpecialtyDoctorQuery, assignSpecialtyValues);

            if (assignSpecialtyResult === 0) console.warn(`Specialty ID ${specialtyId} assignment did not insert any rows. This may indicate the specialty was already assigned.`);
        }

        return { message: 'Doctor updated successfully.', status: 200 };
    } catch (e: any) {
        return { message: `[Internal Server Error]: ${e.message}`, status: 500 };
    }
};

export const RepositoryDeleteDoctorById = async (id: string) => {
    try {
        const deleteQuery = `DELETE FROM app.doctors WHERE id = $1 RETURNING *;`;
        const { rows: deletedDoctor } = await conn.query(deleteQuery, [id]);

        if (deletedDoctor.length === 0) return { message: 'Doctor not found.', status: 404 };

        return { message: 'Doctor deleted successfully.', status: 200 };
    } catch (e: any) {
        return { message: `[Internal Server Error]: ${e.message}`, status: 500 };
    }
};