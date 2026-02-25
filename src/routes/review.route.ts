import { Router } from "express";
import { ReviewController } from "../controller/review.controller.js";
import { authorizeRole } from "middleware/roleMiddleware.js";
import { authMiddleware } from "middleware/authMiddleware.js";
import { authorizeReviewOwnerOrAdmin } from "middleware/authorizeReviewOwnerOrAdmin.middleware.js";

const router = Router();
const controller = new ReviewController();

// Anyone view all reviews
router.get("/", controller.findAll);

// Anyone view review by id
router.get("/:id", controller.findById);

// Anyone view reviews by product
router.get("/product/:product_id", controller.findByProductId);

// Anyone view reviews by user
router.get("/user/:user_id", controller.findByUserId);

// CUSTOMER create review
router.post("/", authMiddleware, authorizeRole("customer"), controller.create);

// OWNER or ADMIN update review
router.put(
  "/:id",
  authMiddleware,
  authorizeReviewOwnerOrAdmin(),
  controller.update,
);

// OWNER or ADMIN  delete review
router.delete(
  "/:id",
  authMiddleware,
  authorizeReviewOwnerOrAdmin(),
  controller.delete,
);

export default router;
