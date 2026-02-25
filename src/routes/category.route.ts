import { Router } from "express";
import { CategoryController } from "controller/category.controller.js";
import { authMiddleware } from "middleware/authMiddleware.js";
import { authorizeRole } from "middleware/roleMiddleware.js";

const router = Router();
const controller = new CategoryController();

router.get("/", controller.findAll);
router.get("/:id", controller.findById);

router.post("/", authMiddleware, authorizeRole("admin"), controller.create);
router.put("/:id", authMiddleware, authorizeRole("admin"), controller.update);
router.delete(
  "/:id",
  authMiddleware,
  authorizeRole("admin"),
  controller.delete,
);

export default router;
