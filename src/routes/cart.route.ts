import { Router } from "express";
import { CartController } from "controller/cart.controller.js";
import { authMiddleware } from "middleware/authMiddleware.js";
import { authorizeRole } from "middleware/roleMiddleware.js";
import { authorizeRoleOrSelf } from "middleware/authorizedRoleOrSelf.middleware.js";

const router = Router();
const controller = new CartController();

router.get("/", authMiddleware, authorizeRole("admin"), controller.findAll);

router.get(
  "/:id",
  authMiddleware,
  authorizeRoleOrSelf("admin"),
  controller.findById,
);

router.post("/", authMiddleware, controller.create);

router.put(
  "/:id",
  authMiddleware,
  authorizeRoleOrSelf("admin"),
  controller.update,
);

router.delete(
  "/:id",
  authMiddleware,
  authorizeRoleOrSelf("admin"),
  controller.delete,
);

export default router;
