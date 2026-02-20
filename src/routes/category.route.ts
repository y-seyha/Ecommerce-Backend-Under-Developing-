import { Router } from "express";
import { CategoryController } from "controller/category.controller.js";

const router = Router();
const controller = new CategoryController();

router.get("/", controller.findAll);
router.get("/:id", controller.findById);
router.post("/", controller.create);
router.put("/:id", controller.update);
router.delete("/:id", controller.delete);

export default router;
