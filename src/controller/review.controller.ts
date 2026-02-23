import { Request, Response, NextFunction } from "express";
import { ReviewService } from "../service/review.service.js";
import { CreateReviewDTO, UpdateReviewDTO } from "../model/review.model.js";
import { Logger } from "utils/logger.js";

export class ReviewController {
  private service = new ReviewService();
  private logger = Logger.getInstance();

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dto = req.body as CreateReviewDTO;
      const review = await this.service.createReview(dto);
      res.status(201).json(review);
    } catch (error) {
      this.logger.error("Review Controller: Create Failed", error);
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = +req.params.id;
      const dto = req.body as UpdateReviewDTO;
      const review = await this.service.updateReview(id, dto);
      res.json(review);
    } catch (error) {
      this.logger.error("Review Controller: Update Failed", error);
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = +req.params.id;
      const success = await this.service.deleteReview(id);
      if (success) res.json({ message: "Deleted Successfully" });
      else res.status(404).json({ message: "Review not found" });
    } catch (error) {
      this.logger.error("Review Controller: Delete Failed", error);
      next(error);
    }
  };

  findAll = async (_: Request, res: Response, next: NextFunction) => {
    try {
      const reviews = await this.service.getAllReviews();
      res.json(reviews);
    } catch (error) {
      this.logger.error("Review Controller: FindAll Failed", error);
      next(error);
    }
  };

  findById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = +req.params.id;
      const review = await this.service.getReviewById(id);
      if (review) res.json(review);
      else res.status(404).json({ message: "Review not found" });
    } catch (error) {
      this.logger.error("Review Controller: FindById Failed", error);
      next(error);
    }
  };

  findByProductId = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const product_id = +req.params.product_id;
      const reviews = await this.service.getReviewsByProductId(product_id);
      res.json(reviews);
    } catch (error) {
      this.logger.error("Review Controller: FindByProductId Failed", error);
      next(error);
    }
  };

  findByUserId = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user_id = +req.params.user_id;
      const reviews = await this.service.getReviewsByUserId(user_id);
      res.json(reviews);
    } catch (error) {
      this.logger.error("Review Controller: FindByUserId Failed", error);
      next(error);
    }
  };
}