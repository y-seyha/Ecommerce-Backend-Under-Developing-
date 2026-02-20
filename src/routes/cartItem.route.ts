import { Router } from "express";
import { CartItemController } from "../controller/cartItem.controller.js";

const router = Router();
const controller = new CartItemController();

router.get("/", controller.findAll);
router.get("/:id", controller.findById);
router.post("/", controller.create);
router.put("/:id", controller.update);
router.delete("/:id", controller.delete);

export default router;
