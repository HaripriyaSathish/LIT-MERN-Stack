import { Router } from "express";
import * as site from "../controllers/siteController.js";
import * as auth from "../controllers/authController.js";
import * as admin from "../controllers/adminController.js";
import { requireAdmin } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";
import { rateLimit } from "../middleware/rateLimit.js";

const router = Router();

// ---------- Public website ----------
router.get("/site", site.home);
router.get("/pages/:slug", site.page);

// ---------- Admin login & password ----------
const loginLimit = rateLimit({ max: 10, minutes: 15, message: "Too many login attempts. Please try again in 15 minutes." });
const resetLimit = rateLimit({ max: 10, minutes: 15 });

router.post("/auth/login", loginLimit, auth.login);
router.post("/auth/forgot-password", resetLimit, auth.forgotPassword);
router.post("/auth/reset-password", resetLimit, auth.resetPassword);
router.get("/auth/me", requireAdmin, auth.me);
router.put("/auth/profile", requireAdmin, auth.updateProfile);
router.put("/auth/password", requireAdmin, auth.changePassword);

// ---------- Admin panel (login required) ----------
router.use("/admin", requireAdmin);
router.get("/admin/schema", admin.schema);
router.get("/admin/stats", admin.stats);
router.post("/admin/upload", upload.single("image"), admin.uploadImage);
router.get("/admin/:resource", admin.list);
router.put("/admin/:resource", admin.updateSingleton);
router.post("/admin/:resource", admin.create);
router.get("/admin/:resource/:id", admin.getOne);
router.put("/admin/:resource/:id", admin.update);
router.delete("/admin/:resource/:id", admin.remove);

export default router;
