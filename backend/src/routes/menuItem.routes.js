import { Router } from "express";
import * as menuItemController from "../controllers/menuItem.controller.js";
import { protect, authorize } from "../middleware/auth.middleware.js";
import { handleMenuItemImageUpload } from "../middleware/menuItemUpload.middleware.js";

const router = Router();

router.use(protect, authorize("OWNER", "MANAGER"));

router.post("/", handleMenuItemImageUpload, menuItemController.createMenuItem);
router.get("/", menuItemController.listMenuItems);
router.get("/:id", menuItemController.getMenuItem);
router.put("/:id", handleMenuItemImageUpload, menuItemController.updateMenuItem);
router.delete("/:id", menuItemController.deleteMenuItem);

export default router;
