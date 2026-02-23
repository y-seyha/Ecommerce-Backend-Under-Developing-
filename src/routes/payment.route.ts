import { Router } from "express";
import { PaymentController } from "../controller/payment.controller.js";

const router = Router();
const controller = new PaymentController();

router.post("/", controller.create);
router.put("/:id", controller.update);
router.delete("/:id", controller.delete);
router.get("/", controller.findAll);
router.get("/:id", controller.findById);
router.get("/order/:order_id", controller.findByOrderId);

export default router;
