import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import pool from "./db/database.js";
import hotelRoutes from "./routes/hotelRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadFolder = process.env.UPLOAD_DIR || path.join(__dirname, "uploads");

async function ensureHotelsTableSchema() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS hotels (
        id SERIAL PRIMARY KEY,
        title VARCHAR(150) NOT NULL,
        description TEXT NOT NULL,
        latitude DECIMAL(10, 7) NOT NULL,
        longitude DECIMAL(10, 7) NOT NULL,
        price DECIMAL(10, 2) NOT NULL CHECK (price > 0),
        image TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const tableCheck = await pool.query(
      `SELECT column_name
       FROM information_schema.columns
       WHERE table_name = 'hotels'`
    );

    const columns = new Set(tableCheck.rows.map((row) => row.column_name));

    if (!columns.has("image") && columns.has("image_path")) {
      await pool.query(`ALTER TABLE hotels RENAME COLUMN image_path TO image`);
    }

    if (!columns.has("image") && !columns.has("image_path")) {
      await pool.query(`ALTER TABLE hotels ADD COLUMN image TEXT`);
    }

    await pool.query(`ALTER TABLE hotels ADD COLUMN IF NOT EXISTS image_data BYTEA`);
    await pool.query(`ALTER TABLE hotels ADD COLUMN IF NOT EXISTS image_mime_type VARCHAR(100)`);
  } catch (error) {
    console.error("Schema check failed:", error.message);
  }
}

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(uploadFolder));

app.get("/", (req, res) => {
  res.json({ message: "Hotel API is running." });
});

app.use("/api/hotels", hotelRoutes);

app.use((error, req, res, next) => {
  if (error.message) {
    return res.status(400).json({ message: error.message });
  }

  res.status(500).json({ message: "Something went wrong." });
});

ensureHotelsTableSchema().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});
