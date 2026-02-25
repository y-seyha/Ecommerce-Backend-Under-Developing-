import { ReviewRepository } from "../repository/review.repository.js";
import { CreateReviewDTO, UpdateReviewDTO } from "../model/review.model.js";
import { Logger } from "utils/logger.js";
import { Database } from "Configuration/database.js";

export class ReviewService {
  private repo = new ReviewRepository();
  private logger = Logger.getInstance();
  private pool = Database.getInstance();

  async createReview(dto: CreateReviewDTO) {
    // Validate rating
    if (dto.rating < 1 || dto.rating > 5) {
      this.logger.warn(`Create Review Failed: Invalid rating ${dto.rating}`);
      throw new Error("Rating must be between 1 and 5");
    }

    // Check if user exists
    const { rows: userRows } = await this.pool.query(
      `SELECT id FROM users WHERE id=$1`,
      [dto.user_id],
    );
    if (!userRows.length) {
      this.logger.warn(`Create Review Failed: User ${dto.user_id} not found`);
      throw new Error("User does not exist");
    }

    // Check if product exists
    const { rows: productRows } = await this.pool.query(
      `SELECT id FROM products WHERE id=$1`,
      [dto.product_id],
    );
    if (!productRows.length) {
      this.logger.warn(
        `Create Review Failed: Product ${dto.product_id} not found`,
      );
      throw new Error("Product does not exist");
    }

    return this.repo.insert(dto);
  }

  async updateReview(id: number, dto: UpdateReviewDTO) {
    if (dto.rating !== undefined && (dto.rating < 1 || dto.rating > 5)) {
      throw new Error("Rating must be between 1 and 5");
    }

    const existing = await this.repo.findById(id);
    if (!existing) {
      this.logger.warn(`Update Review Failed: Review ${id} not found`);
      throw new Error("Review does not exist");
    }

    return this.repo.update(id, dto);
  }

  async deleteReview(id: number) {
    const existing = await this.repo.findById(id);
    if (!existing) {
      this.logger.warn(`Delete Review Failed: Review ${id} not found`);
      return false;
    }
    return this.repo.delete(id);
  }

  async getAllReviews() {
    return this.repo.findAll();
  }

  async getReviewById(id: number) {
    const review = await this.repo.findById(id);
    if (!review) this.logger.warn(`Review ${id} not found`);
    return review;
  }

  async getReviewsByProductId(product_id: number) {
    return this.repo.findByProductId(product_id);
  }

  async getReviewsByUserId(user_id: number) {
    return this.repo.findByUserId(user_id);
  }

  async getReviewPaginated(page: number, pageSize: number) {
    try {
      return await this.repo.findAllPaginated(page, pageSize);
    } catch (error) {
      this.logger.error("Product Service : GetPaginated Failed", error);
      throw Error;
    }
  }
}
