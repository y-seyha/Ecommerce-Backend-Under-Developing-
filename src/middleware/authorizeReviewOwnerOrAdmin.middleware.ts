import { Request, Response, NextFunction } from "express";
import { Logger } from "utils/logger.js";
import { ReviewRepository } from "repository/review.repository.js";

const logger = Logger.getInstance();
const reviewRepo = new ReviewRepository();

export const authorizeReviewOwnerOrAdmin = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Admin bypass
      if (req.user.role === "admin") {
        return next();
      }

      const reviewId = +req.params.id;
      const review = await reviewRepo.findById(reviewId);

      if (!review) {
        return res.status(404).json({ message: "Review not found" });
      }

      if (review.user_id !== req.user.id) {
        logger.warn(
          `Forbidden: user ${req.user.id} tried to modify review ${reviewId}`
        );
        return res.status(403).json({
          message: "Forbidden: Not your review",
        });
      }

      next();
    } catch (err) {
      logger.error("Review ownership check failed");
      res.status(500).json({ message: "Server error" });
    }
  };
};