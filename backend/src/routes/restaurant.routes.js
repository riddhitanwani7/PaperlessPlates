import { Router } from "express";
import * as restaurantController from "../controllers/restaurant.controller.js";
import { protect, authorize } from "../middleware/auth.middleware.js";
import { handleMenuUpload } from "../middleware/upload.middleware.js";
import {
  handleLogoUpload,
  handleCoverUpload,
} from "../middleware/restaurantImageUpload.middleware.js";

const router = Router();

const ownerManager = authorize("OWNER", "MANAGER");
const ownerOnly = authorize("OWNER");

router.use(protect);

router.post("/onboarding", restaurantController.saveOnboarding);
router.get("/me", ownerManager, restaurantController.getMyRestaurant);
router.patch("/onboarding/complete", restaurantController.completeOnboarding);
router.get("/me/menu", ownerManager, restaurantController.getMyMenu);
router.post("/menu/upload", ownerManager, handleMenuUpload, restaurantController.uploadMenu);
router.delete("/me/menu", ownerManager, restaurantController.deleteMenu);

// Restaurant profile
router.patch("/me/profile", ownerManager, restaurantController.updateProfile);
router.post("/me/logo", ownerManager, handleLogoUpload, restaurantController.uploadLogo);
router.post("/me/cover", ownerManager, handleCoverUpload, restaurantController.uploadCoverImage);

// Theme
router.patch("/me/theme", ownerManager, restaurantController.updateTheme);

// Settings
router.patch("/me/settings", ownerOnly, restaurantController.updateSettings);

// Payment settings
router.get("/me/payment-settings", ownerOnly, restaurantController.getPaymentSettings);
router.post("/me/payment-settings", ownerOnly, restaurantController.savePaymentSettings);
router.post("/me/payment-settings/test", ownerOnly, restaurantController.testPaymentSettings);

export default router;
