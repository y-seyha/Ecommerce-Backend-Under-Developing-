import { Router } from "express";
import { OrderItemController } from "../controller/orderItem.controller.js";

const router = Router();
const controller = new OrderItemController();

router.post("/", controller.create);
router.get("/", controller.findAll);
router.get("/:id", controller.findById);
router.get("/order/:order_id", controller.findByOrderId);
router.put("/:id", controller.update);
router.delete("/:id", controller.delete);

export default router;
