import { Router } from "express";
import { CartItemController } from "../controller/cartItem.controller.js";
import { authMiddleware } from "middleware/authMiddleware.js";
import { authorizeRole } from "middleware/roleMiddleware.js";

const router = Router();
const controller = new CartItemController();

router.get("/", authMiddleware, authorizeRole("admin"), controller.findAll);
router.get("/:id", authMiddleware, controller.findById);
router.post("/", authMiddleware, controller.create);
router.put("/:id", authMiddleware, controller.update);
router.delete("/:id", authMiddleware, controller.delete);

export default router;
