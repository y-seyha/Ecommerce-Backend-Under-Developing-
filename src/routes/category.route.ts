import { Router } from "express";
import { CategoryController } from "controller/category.controller.js";
import { authMiddleware } from "middleware/authMiddleware.js";
import { authorizeRole } from "middleware/roleMiddleware.js";
import { validate } from "middleware/validate.middleware.js";
import { CategoryValidator } from "valildators/category.validator.js";

const router = Router();
const controller = new CategoryController();

router.get("/", controller.findAll);
router.get(
  "/:id",
  validate(CategoryValidator.getCategoryByIdSchema),
  controller.findById,
);

router.post(
  "/",
  authMiddleware,
  authorizeRole("admin"),
  validate(CategoryValidator.createCategorySchema),
  controller.create,
);
router.put(
  "/:id",
  authMiddleware,
  authorizeRole("admin"),
  validate(CategoryValidator.updateCategorySchema),
  controller.update,
);
router.delete(
  "/:id",
  authMiddleware,
  authorizeRole("admin"),
  validate(CategoryValidator.getCategoryByIdSchema),
  controller.delete,
);


export default router;
