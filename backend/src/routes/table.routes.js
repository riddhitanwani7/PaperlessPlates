import express from "express";
import * as tableController from "../controllers/table.controller.js";
import { protect, authorize } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(protect, authorize("OWNER", "MANAGER", "WAITER"));

router.post("/", tableController.createTable);
router.get("/restaurant/:restaurantId", tableController.getRestaurantTables);
router.get("/:id", tableController.getTableById);
router.patch("/:id", tableController.updateTable);
router.delete("/:id", tableController.deleteTable);

export default router;
