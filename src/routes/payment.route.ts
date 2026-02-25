import { Router } from "express";
import { PaymentController } from "../controller/payment.controller.js";
import { authMiddleware } from "middleware/authMiddleware.js";
import { authorizeRole } from "middleware/roleMiddleware.js";
import { authorizePaymentOwnerOrAdmin } from "middleware/authorizePaymentOwnerOrAdmin.middleware.js";

const router = Router();
const controller = new PaymentController();

// CUSTOMER  create payment
router.post("/", authMiddleware, authorizeRole("customer"), controller.create);

// ADMIN  update
router.put("/:id", authMiddleware, authorizeRole("admin"), controller.update);

// ADMIN  delete
router.delete(
  "/:id",
  authMiddleware,
  authorizeRole("admin"),
  controller.delete,
);

// ADMIN  view all
router.get("/", authMiddleware, authorizeRole("admin"), controller.findAll);

// OWNER or ADMIN → view payment
router.get(
  "/:id",
  authMiddleware,
  authorizePaymentOwnerOrAdmin(),
  controller.findById,
);

// OWNER or ADMIN → view by order
router.get(
  "/order/:order_id",
  authMiddleware,
  authorizePaymentOwnerOrAdmin(),
  controller.findByOrderId,
);

export default router;
