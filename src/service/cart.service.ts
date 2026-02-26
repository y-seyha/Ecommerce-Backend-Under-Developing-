import { Database } from "Configuration/database.js";
import { Cart, CreateCartDto, UpdateCartDto } from "model/cart.model.js";
import { CartRepository } from "repository/cart.repository.js";
import { Logger } from "utils/logger.js";
import redisClient from "../Configuration/redis.js";

export class CartService {
  private repo = new CartRepository();
  private logger = Logger.getInstance();
  private pool = Database.getInstance();

  async createCart(dto: CreateCartDto) {
    const { rows } = await this.pool.query(`SELECT * FROM users WHERE id=$1`, [
      dto.user_id,
    ]);
    if (!rows.length) {
      this.logger.warn(`Create Cart Failed: User ${dto.user_id} not found`);
      throw new Error("User does not exist");
    }

    const cart = await this.repo.create(dto);

    try {
      const cacheKey = `cart:${dto.user_id}`;
      await redisClient.setEx(cacheKey, 24 * 60 * 60, JSON.stringify(cart));
    } catch (err) {
      this.logger.warn("Redis Error on createCart", err);
    }

    return cart;
  }

  async updateCart(id: number, dto: UpdateCartDto) {
    const existing = await this.repo.findById(id);
    if (!existing) {
      this.logger.warn(`Update Failed: Cart ${id} not found`);
      throw new Error("Cart does not exist");
    }

    if (dto.user_id) {
      const { rows } = await this.pool.query(
        `SELECT id FROM users WHERE id=$1`,
        [dto.user_id],
      );

      if (!rows.length) {
        this.logger.warn(`Update Failed: User ${dto.user_id} not found`);
        throw new Error("User does not exist");
      }
    }

    const updateCart: Cart = {
      ...existing,
      ...dto,
      user_id: dto.user_id ?? existing.user_id, // ensure number
    };

    const updated = await this.repo.update(id, updateCart);

    try {
      const oldUserId = existing.user_id;
      const newUserId = updated.user_id;

      // delete old cache if user_id changed
      if (oldUserId !== newUserId) {
        await redisClient.del(`cart:${oldUserId}`);
      }

      const cacheKey = `cart:${newUserId}`;
      await redisClient.setEx(cacheKey, 24 * 60 * 60, JSON.stringify(updated));
    } catch (err) {
      this.logger.error("Redis Error on updateCart", err);
    }

    return updated;
  }

  async deleteCart(id: number) {
    const existing = await this.repo.findById(id);
    if (!existing) {
      this.logger.warn(`Delete Failed: Cart ${id} not found`);
    }
    await this.repo.delete(id);

    try {
      const cacheKey = `cart:${existing.user_id}`;
      await redisClient.del(cacheKey);
    } catch (err) {
      this.logger.error("Redis Error on deleteCart", err);
    }
  }

  async getAllCarts() {
    return await this.repo.findAll();
  }

  async getCartById(id: number) {
    const cacheKey = `cart:${id}`;

    try {
      // Check Redis first
      const cached = await redisClient.get(cacheKey);
      if (cached) return JSON.parse(cached);

      // Fetch from DB
      const cart = await this.repo.findById(id);
      if (!cart) {
        this.logger.warn(`Cart ${id} not found`);
        return null;
      }

      // Save to Redis
      await redisClient.setEx(cacheKey, 24 * 60 * 60, JSON.stringify(cart));

      return cart;
    } catch (err) {
      this.logger.error("Redis Error in getCartById", err);
      // fallback to DB
      const cart = await this.repo.findById(id);
      if (!cart) this.logger.warn(`Cart ${id} not found`);
      return cart;
    }
  }

  async getCartPaginated(page: number, pageSize: number) {
    try {
      return await this.repo.findAllPaginated(page, pageSize);
    } catch (error) {
      this.logger.error("Cart Service: GetPaginated Failed", error);
      throw error;
    }
  }
}
