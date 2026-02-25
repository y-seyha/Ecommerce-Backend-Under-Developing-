import { Router } from "express";
import { OrderController } from "controller/order.controller.js";
import { authMiddleware } from "middleware/authMiddleware.js";
import { authorizeRole } from "middleware/roleMiddleware.js";
import { authorizeOrderOwnerOrAdmin } from "middleware/authorizeOrderOwnerOrAdmin.middleware.js";

const router = Router();
const controller = new OrderController();

router.post(
  "/",
  authMiddleware,
  authorizeRole("customer"),

  controller.create,
);

// ADMIN see all orders
router.get("/", authMiddleware, authorizeRole("admin"), controller.findAll);

// OWNER or ADMIN → view order
router.get(
  "/:id",
  authMiddleware,
  authorizeOrderOwnerOrAdmin(),
  controller.findById,
);

// SELLER or ADMIN update order status
router.put(
  "/:id",
  authMiddleware,
  authorizeRole("seller", "admin"),
  controller.update,
);

// ADMIN delete order
router.delete(
  "/:id",
  authMiddleware,
  authorizeRole("admin"),
  controller.delete,
);

export default router;
