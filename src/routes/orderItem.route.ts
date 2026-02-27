import { Router } from "express";
import { OrderItemController } from "../controller/orderItem.controller.js";
import { authorizeRole } from "middleware/roleMiddleware.js";
import { authMiddleware } from "middleware/authMiddleware.js";
import { authorizeOrderOwnerOrAdmin } from "middleware/authorizeOrderOwnerOrAdmin.middleware.js";
import { validate } from "middleware/validate.middleware.js";
import { OrderItemValidator } from "valildators/orderItem.validator.js";

const router = Router();
const controller = new OrderItemController();
router.get(
  "/paginated",
  authMiddleware,
  authorizeRole("admin"),
  controller.getPaginated.bind(controller),
);
// ADMIN only
router.get("/", authMiddleware, authorizeRole("admin"), controller.findAll);
router.post(
  "/",
  authMiddleware,
  authorizeRole("admin", "seller"),
  validate(OrderItemValidator.createOrderItemSchema),
  controller.create.bind(controller),
);

// OWNER or ADMIN
router.get(
  "/:id",
  authMiddleware,
  authorizeOrderOwnerOrAdmin(),
  validate(OrderItemValidator.getOrderItemByIdSchema),
  controller.findById,
);

// OWNER or ADMIN
router.get(
  "/order/:order_id",
  authMiddleware,
  authorizeOrderOwnerOrAdmin(),
  validate(OrderItemValidator.getByOrderIdSchema),
  controller.findByOrderId,
);

// ADMIN or SELLER update order items
router.put(
  "/:id",
  authMiddleware,
  authorizeRole("admin", "seller"),
  validate(OrderItemValidator.updateOrderItemSchema),
  controller.update,
);

// ADMIN only
router.delete(
  "/:id",
  authMiddleware,
  authorizeRole("admin"),
  validate(OrderItemValidator.getOrderItemByIdSchema),
  controller.delete,
);

export default router;
