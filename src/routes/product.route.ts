import { Router } from "express";
import { ProductController } from "controller/product.controller.js";
import { authMiddleware } from "middleware/authMiddleware.js";
import { authorizeRole } from "middleware/roleMiddleware.js";

const router = Router();
const controller = new ProductController();

router.get("/", controller.findAll);
router.get("/:id", controller.findById);

router.post(
  "/",
  authMiddleware,
  authorizeRole("admin", "seller"),
  controller.create,
);
router.put(
  "/:id",
  authMiddleware,
  authorizeRole("admin", "seller"),
  controller.update,
);
router.delete(
  "/:id",
  authMiddleware,
  authorizeRole("admin", "seller"),
  controller.delete,
);

export default router;
