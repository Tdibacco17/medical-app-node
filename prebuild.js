const { Pool } = require('pg');

const pool = new Pool({
    // host: DB_HOST,
    // database: DB_DATABASE,
    // user: DB_USER,
    // password: DB_PASSWORD,
    // port: DB_PORT,
});

(async () => {
    const client = await pool.connect();
    try {
        console.log('Connected to the database successfully');

        await client.query("SET TIMEZONE='America/Argentina/Buenos_Aires'");
        console.log('Timezone set to Buenos Aires');

        const createTablesQuery = `
            -- Tabla de usuarios
            CREATE TABLE IF NOT EXISTS app.users (
                id UUID PRIMARY KEY,
                email VARCHAR(255) NOT NULL UNIQUE,
                password TEXT NOT NULL,
                is_blocked BOOLEAN DEFAULT FALSE,
                recover_password BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW()
            );

            -- Tabla de permisos
            CREATE TABLE IF NOT EXISTS app.permissions (
                id TEXT PRIMARY KEY,
                description TEXT,
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW()
            );

            -- Tabla relacional entre usuarios y permisos
            CREATE TABLE IF NOT EXISTS app.users_permissions (
                user_id UUID REFERENCES app.users(id) ON DELETE CASCADE,
                permission_id TEXT REFERENCES app.permissions(id) ON DELETE CASCADE,
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW(),
                PRIMARY KEY (user_id, permission_id)
            );

            -- Tabla de especialidades
            CREATE TABLE IF NOT EXISTS app.specialties (
                id UUID PRIMARY KEY,
                description TEXT NOT NULL,
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW()
            );

            -- Tabla de doctores
            CREATE TABLE IF NOT EXISTS app.doctors (
                id UUID PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                lastname VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL,
                phone VARCHAR(20),
                dni VARCHAR(20) NOT NULL,
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW()
            );

            -- Tabla relacional entre especialidades y doctores
            CREATE TABLE IF NOT EXISTS app.specialties_doctors (
                specialty_id UUID REFERENCES app.specialties(id) ON DELETE CASCADE,
                doctor_id UUID REFERENCES app.doctors(id) ON DELETE CASCADE,
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW(),
                PRIMARY KEY (specialty_id, doctor_id)
            );
        `;

        await client.query(createTablesQuery);
        console.log('Tables created successfully or already exist.');

        // Insertar permisos predeterminados
        const insertPermissionsQuery = `
            INSERT INTO app.permissions (id, description)
            VALUES
                ('A', 'Admin'),
                ('C', 'Customer')
            ON CONFLICT (id) DO NOTHING;  -- Evita insertar duplicados si ya existen
        `;

        await client.query(insertPermissionsQuery);
        console.log('Permissions inserted successfully or already exist.');

    } catch (error) {
        console.error('Error occurred while creating tables or inserting permissions:', error.message);
    } finally {
        client.release();
        console.log('Client connection released');

        // Cerrar la conexión del pool
        await pool.end();
        console.log('Pool connection closed');
    }
})();
