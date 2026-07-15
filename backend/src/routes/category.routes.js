import { Router } from "express";
import * as categoryController from "../controllers/category.controller.js";
import { protect, authorize } from "../middleware/auth.middleware.js";

const router = Router();

router.use(protect, authorize("OWNER", "MANAGER"));

router.post("/", categoryController.createCategory);
router.get("/", categoryController.listCategories);
router.put("/:id", categoryController.updateCategory);
router.delete("/:id", categoryController.deleteCategory);

export default router;
