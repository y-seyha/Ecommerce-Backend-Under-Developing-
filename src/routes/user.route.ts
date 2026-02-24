import { Router } from "express";
import { UserController } from "controller/user.controller.js";
import { UserValidator } from "valildators/user.validator.js";
import { validate } from "../middleware/validate.middleware.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { authorizeRole } from "../middleware/roleMiddleware.js";
import { authorizeRoleOrSelf } from "middleware/authorizedRoleOrSelf.middleware.js";

const router = Router();
const controller = new UserController();

// Register
router.post(
  "/register",
  validate(UserValidator.createUserSchema),
  controller.register.bind(controller),
);

// Login
router.post(
  "/login",
  validate(UserValidator.loginSchema),
  controller.login.bind(controller),
);

// Protected routes (auth + roles required)
// Get all users → Admin only
router.get(
  "/",
  authMiddleware,
  authorizeRole("admin"),
  controller.getAll.bind(controller),
);

// Get user by ID → Admin and Seller
router.get(
  "/:id",
  authMiddleware,
  authorizeRole("admin"),
  validate(UserValidator.getUserByIdSchema),
  controller.getById.bind(controller),
);

// Update user → Admin and Seller
router.put(
  "/:id",
  authMiddleware,
  authorizeRoleOrSelf("admin"),
  validate(UserValidator.updateUserSchema),
  controller.update.bind(controller),
);

// Delete user → Admin only
router.delete(
  "/:id",
  authMiddleware,
  authorizeRoleOrSelf("admin"),
  validate(UserValidator.getUserByIdSchema),
  controller.delete.bind(controller),
);

export default router;
