import { Pool } from "pg";

const pool = new Pool({
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DATABASE,
  port: parseInt(process.env.POSTGRES_PORT || "5432", 10),
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

async function query(text, params) {
  try {
    const res = await pool.query(text, params);
    return res;
  } catch (error) {
    console.error("PostgreSQL query error:", error);
    throw error;
  }
}
// Function to initialize the database (create tables if they don't exist)
async function initializeDatabase() {
  try {
    await query(`
            CREATE TABLE IF NOT EXISTS notes (
                _id UUID PRIMARY KEY,
                "localId" UUID,
                title VARCHAR(255),
                content TEXT,
                tags TEXT[],
                "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);
  } catch (error) {
    console.error("Error initializing database:", error);
    throw error;
  }
}

// Function to initializing tags table
async function initializeTagsTable() {
  try {
    await query(`CREATE TABLE IF NOT EXISTS tags (
    id SERIAL PRIMARY KEY,
    tagname VARCHAR(255) UNIQUE NOT NULL
);`);
  } catch (error) {
    console.error("Error initializing database:", error);
    throw error;
  }
}
(async () => {
  await initializeDatabase();
  await initializeTagsTable();
})();

export { query, initializeDatabase };
