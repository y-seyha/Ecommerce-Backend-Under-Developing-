import { Router } from "express";
import { CartController } from "controller/cart.controller.js";
import { authMiddleware } from "middleware/authMiddleware.js";
import { authorizeRole } from "middleware/roleMiddleware.js";
import { authorizeRoleOrSelf } from "middleware/authorizedRoleOrSelf.middleware.js";
import { validate } from "middleware/validate.middleware.js";
import { CartValidator } from "valildators/cart.validator.js";

const router = Router();
const controller = new CartController();

router.get("/", authMiddleware, authorizeRole("admin"), controller.findAll);

router.get(
  "/:id",
  authMiddleware,
  authorizeRoleOrSelf("admin"),
  validate(CartValidator.getCartByIdSchema),
  controller.findById,
);

router.post(
  "/",
  authMiddleware,
  validate(CartValidator.createCartSchema),
  controller.create,
);

router.put(
  "/:id",
  authMiddleware,
  authorizeRoleOrSelf("admin"),
  validate(CartValidator.updateCartSchema),
  controller.update,
);

router.delete(
  "/:id",
  authMiddleware,
  authorizeRoleOrSelf("admin"),
  validate(CartValidator.getCartByIdSchema),
  controller.delete,
);

export default router;
