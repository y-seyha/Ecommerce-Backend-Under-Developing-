import { Router } from "express";
import { CheckoutController } from "controller/checkout.controller.js";
import { authMiddleware } from "middleware/authMiddleware.js";

const router = Router();
const controller = new CheckoutController();

router.post("/", authMiddleware, controller.checkout.bind(controller));

export default router;
