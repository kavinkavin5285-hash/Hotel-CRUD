import express from "express";
import upload from "../middleware/upload.js";
import {
  createHotel,
  getHotels,
  getHotelById,
  getHotelImage,
  updateHotel,
  deleteHotel,
} from "../controllers/hotelController.js";

const router = express.Router();

router.post("/", upload.single("image"), createHotel);
router.get("/", getHotels);
router.get("/:id/image", getHotelImage);
router.get("/:id", getHotelById);
router.put("/:id", upload.single("image"), updateHotel);
router.delete("/:id", deleteHotel);

export default router;
