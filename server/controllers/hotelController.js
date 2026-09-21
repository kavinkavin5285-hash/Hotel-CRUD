import pool from "../db/database.js";

const isValidLatitude = (value) => {
  const number = Number(value);
  return Number.isFinite(number) && number >= -90 && number <= 90;
};

const isValidLongitude = (value) => {
  const number = Number(value);
  return Number.isFinite(number) && number >= -180 && number <= 180;
};

const isPositivePrice = (value) => {
  const number = Number(value);
  return Number.isFinite(number) && number > 0;
};

export const createHotel = async (req, res) => {
  try {
    const { title, description, latitude, longitude, price } = req.body;

    if (!title || !description || latitude === undefined || longitude === undefined || price === undefined) {
      return res.status(400).json({ message: "All fields are required." });
    }

    if (!isValidLatitude(latitude)) {
      return res.status(400).json({ message: "Latitude must be between -90 and 90." });
    }

    if (!isValidLongitude(longitude)) {
      return res.status(400).json({ message: "Longitude must be between -180 and 180." });
    }

    if (!isPositivePrice(price)) {
      return res.status(400).json({ message: "Price must be greater than 0." });
    }

    const result = await pool.query(
      `INSERT INTO hotels
       (title, description, latitude, longitude, price, image_data, image_mime_type)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        title.trim(),
        description.trim(),
        Number(latitude),
        Number(longitude),
        Number(price),
        req.file?.buffer || null,
        req.file?.mimetype || null,
      ]
    );

    res.status(201).json(formatHotel(result.rows[0]));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create hotel." });
  }
};

export const getHotels = async (req, res) => {
  try {
    const { title = "", minPrice, maxPrice, limit = 6, offset = 0 } = req.query;

    const safeLimit = Math.min(Math.max(parseInt(limit, 10) || 6, 1), 50);
    const safeOffset = Math.max(parseInt(offset, 10) || 0, 0);

    const values = [];
    const conditions = [];

    if (title.trim()) {
      values.push(`%${title.trim()}%`);
      conditions.push(`title ILIKE $${values.length}`);
    }

    if (minPrice !== undefined && minPrice !== "") {
      if (!isPositivePrice(minPrice)) {
        return res.status(400).json({ message: "minPrice must be greater than 0." });
      }
      values.push(Number(minPrice));
      conditions.push(`price >= $${values.length}`);
    }

    if (maxPrice !== undefined && maxPrice !== "") {
      if (!isPositivePrice(maxPrice)) {
        return res.status(400).json({ message: "maxPrice must be greater than 0." });
      }
      values.push(Number(maxPrice));
      conditions.push(`price <= $${values.length}`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    values.push(safeLimit);
    const limitPosition = values.length;

    values.push(safeOffset);
    const offsetPosition = values.length;

    const result = await pool.query(
      `SELECT *
       FROM hotels
       ${where}
       ORDER BY id DESC
       LIMIT $${limitPosition}
       OFFSET $${offsetPosition}`,
      values
    );

    const countResult = await pool.query(
      `SELECT COUNT(*)::int AS total FROM hotels ${where}`,
      values.slice(0, values.length - 2)
    );

    res.json({
      hotels: result.rows.map(formatHotel),
      total: countResult.rows[0].total,
      limit: safeLimit,
      offset: safeOffset,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to get hotels." });
  }
};

export const getHotelById = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM hotels WHERE id = $1",
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Hotel not found." });
    }

    res.json(formatHotel(result.rows[0]));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to get hotel." });
  }
};

export const updateHotel = async (req, res) => {
  try {
    const { title, description, latitude, longitude, price } = req.body;

    if (!title || !description || latitude === undefined || longitude === undefined || price === undefined) {
      return res.status(400).json({ message: "All fields are required." });
    }

    if (!isValidLatitude(latitude)) {
      return res.status(400).json({ message: "Latitude must be between -90 and 90." });
    }

    if (!isValidLongitude(longitude)) {
      return res.status(400).json({ message: "Longitude must be between -180 and 180." });
    }

    if (!isPositivePrice(price)) {
      return res.status(400).json({ message: "Price must be greater than 0." });
    }

    const oldResult = await pool.query(
      "SELECT * FROM hotels WHERE id = $1",
      [req.params.id]
    );

    if (oldResult.rows.length === 0) {
      return res.status(404).json({ message: "Hotel not found." });
    }

    const oldHotel = oldResult.rows[0];
    const imageData = req.file ? req.file.buffer : oldHotel.image_data;
    const imageMimeType = req.file ? req.file.mimetype : oldHotel.image_mime_type;

    const result = await pool.query(
      `UPDATE hotels
       SET title = $1,
           description = $2,
           latitude = $3,
           longitude = $4,
             price = $5,
             image_data = $6,
             image_mime_type = $7,
           updated_at = CURRENT_TIMESTAMP
           WHERE id = $8
       RETURNING *`,
      [
        title.trim(),
        description.trim(),
        Number(latitude),
        Number(longitude),
        Number(price),
        imageData,
        imageMimeType,
        req.params.id,
      ]
    );

    res.json(formatHotel(result.rows[0]));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update hotel." });
  }
};

export const deleteHotel = async (req, res) => {
  try {
    const result = await pool.query(
      "DELETE FROM hotels WHERE id = $1 RETURNING *",
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Hotel not found." });
    }

    res.json({ message: "Hotel deleted successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete hotel." });
  }
};

export const getHotelImage = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT image_data, image_mime_type FROM hotels WHERE id = $1",
      [req.params.id]
    );

    if (result.rows.length === 0 || !result.rows[0].image_data) {
      return res.status(404).json({ message: "Hotel image not found." });
    }

    res.type(result.rows[0].image_mime_type || "application/octet-stream");
    res.send(result.rows[0].image_data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to get hotel image." });
  }
};

const formatHotel = (hotel) => ({
  ...hotel,
  image: hotel.image_data
    ? `/api/hotels/${hotel.id}/image`
    : hotel.image || null,
  image_data: undefined,
  image_mime_type: undefined,
});
