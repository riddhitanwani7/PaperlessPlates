import { Router } from "express";
import * as publicController from "../controllers/public.controller.js";

const router = Router();

router.get("/restaurant/:slug/categories", publicController.getPublicCategories);
router.get("/restaurant/:slug/menu", publicController.getPublicMenu);
router.get("/restaurant/:slug", publicController.getPublicRestaurant);
router.post("/restaurant/:slug/scan", publicController.recordScan);
router.get("/menu-item/:id", publicController.getPublicMenuItem);

export default router;
