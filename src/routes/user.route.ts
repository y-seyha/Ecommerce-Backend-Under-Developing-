import { Router } from "express";
import { UserController } from "controller/user.controller.js";
import { UserValidator } from "../valildators/user.validator.js";
import { validate } from "../middleware/validate.middleware.js";

const router = Router();
const controller = new UserController();

// Register route with validation
router.post(
  "/register",
  validate(UserValidator.createUserSchema),
  controller.register.bind(controller),
);

// Login route with validation
router.post(
  "/login",
  validate(UserValidator.loginSchema),
  controller.login.bind(controller),
);

// Other routes (you can add validation for update or getById if you want)
router.get("/", controller.getAll.bind(controller));

router.get(
  "/:id",
  validate(UserValidator.getUserByIdSchema),
  controller.getById.bind(controller),
);

router.put(
  "/:id",
  validate(UserValidator.updateUserSchema),
  controller.update.bind(controller),
);

router.delete(
  "/:id",
  validate(UserValidator.getUserByIdSchema),
  controller.delete.bind(controller),
);

export default router;
