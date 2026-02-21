import { Router } from "express";
import { OrderController } from "controller/order.controller.js";

const router = Router();
const controller = new OrderController();

router.post("/", controller.create);
router.get("/", controller.findAll);
router.get("/:id", controller.findById);
router.put("/:id", controller.update);
router.delete("/:id", controller.delete);

export default router;
