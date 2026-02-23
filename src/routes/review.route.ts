import { Router } from "express";
import { ReviewController } from "../controller/review.controller.js";

const router = Router();
const controller = new ReviewController();

router.post("/", controller.create);
router.put("/:id", controller.update);
router.delete("/:id", controller.delete);
router.get("/", controller.findAll);
router.get("/:id", controller.findById);
router.get("/product/:product_id", controller.findByProductId);
router.get("/user/:user_id", controller.findByUserId);

export default router;
