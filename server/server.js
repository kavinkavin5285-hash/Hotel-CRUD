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

async function ensureHotelsTableSchema() {
  try {
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
  } catch (error) {
    console.error("Schema check failed:", error.message);
  }
}

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

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
