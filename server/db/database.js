import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || "hotel_db",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "521985",
});

export default pool;
