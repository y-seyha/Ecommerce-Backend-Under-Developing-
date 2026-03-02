import { Request, Router, Response } from "express";
import { AuthController } from "controller/auth.controller.js";

const router = Router();
const authController = new AuthController();

// Start Google OAuth login
router.get("/google", authController.googleLogin.bind(authController));

// Google OAuth callback
router.get(
  "/google/callback",
  authController.googleCallback.bind(authController),
);

//Logout
router.post("/logout", authController.logout.bind(authController));

export default router;
