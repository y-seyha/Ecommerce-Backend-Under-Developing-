import { Router } from "express";
import { OrderItemController } from "../controller/orderItem.controller.js";
import { authorizeRole } from "middleware/roleMiddleware.js";
import { authMiddleware } from "middleware/authMiddleware.js";
import { authorizeOrderOwnerOrAdmin } from "middleware/authorizeOrderOwnerOrAdmin.middleware.js";

const router = Router();
const controller = new OrderItemController();

// ADMIN only
router.get("/", authMiddleware, authorizeRole("admin"), controller.findAll);

// OWNER or ADMIN
router.get(
  "/:id",
  authMiddleware,
  authorizeOrderOwnerOrAdmin(),
  controller.findById,
);

// OWNER or ADMIN
router.get(
  "/order/:order_id",
  authMiddleware,
  authorizeOrderOwnerOrAdmin(),
  controller.findByOrderId,
);

// ADMIN or SELLER update order items
router.put(
  "/:id",
  authMiddleware,
  authorizeRole("admin", "seller"),
  controller.update,
);

// ADMIN only
router.delete(
  "/:id",
  authMiddleware,
  authorizeRole("admin"),
  controller.delete,
);

export default router;
