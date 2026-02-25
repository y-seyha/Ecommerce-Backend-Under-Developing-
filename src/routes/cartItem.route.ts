import { Router } from "express";
import { CartItemController } from "../controller/cartItem.controller.js";
import { authMiddleware } from "middleware/authMiddleware.js";
import { authorizeRole } from "middleware/roleMiddleware.js";
import { validate } from "middleware/validate.middleware.js";
import { CartItemValidator } from "valildators/cartItem.validator.js";

const router = Router();
const controller = new CartItemController();

router.get("/", authMiddleware, authorizeRole("admin"), controller.findAll);
router.get(
  "/:id",
  authMiddleware,
  validate(CartItemValidator.getCartItemByIdSchema),
  controller.findById,
);
router.post(
  "/",
  authMiddleware,
  validate(CartItemValidator.createCartItemSchema),
  controller.create,
);
router.put(
  "/:id",
  authMiddleware,
  validate(CartItemValidator.updateCartItemSchema),
  controller.update,
);
router.delete(
  "/:id",
  authMiddleware,
  validate(CartItemValidator.getCartItemByIdSchema),
  controller.delete,
);

export default router;
