import express from "express";
import * as roomController from "../controllers/room.controller.js";
import { protect, authorize } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(protect, authorize("OWNER", "MANAGER", "WAITER"));

router.post("/", roomController.createRoom);
router.get("/restaurant/:restaurantId", roomController.getRestaurantRooms);
router.get("/:id", roomController.getRoomById);
router.patch("/:id", roomController.updateRoom);
router.delete("/:id", roomController.deleteRoom);

export default router;
