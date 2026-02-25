import { Router } from "express";
import { ProductController } from "controller/product.controller.js";
import { authMiddleware } from "middleware/authMiddleware.js";
import { authorizeRole } from "middleware/roleMiddleware.js";
import { ProductValidator } from "valildators/product.validator.js";
import { validate } from "middleware/validate.middleware.js";

const router = Router();
const controller = new ProductController();

router.get("/", controller.findAll);

router.get(
  "/paginated",
  authMiddleware,
  authorizeRole("admin"),
  controller.getPaginated.bind(controller),
);

router.get(
  "/:id",
  validate(ProductValidator.getProductByIdSchema),
  controller.findById,
);

router.post(
  "/",
  authMiddleware,
  authorizeRole("admin", "seller"),
  validate(ProductValidator.createProductSchema),
  controller.create,
);
router.put(
  "/:id",
  authMiddleware,
  authorizeRole("admin", "seller"),
  validate(ProductValidator.updateProductSchema),
  controller.update,
);
router.delete(
  "/:id",
  authMiddleware,
  authorizeRole("admin", "seller"),
  validate(ProductValidator.getProductByIdSchema),
  controller.delete,
);

export default router;
