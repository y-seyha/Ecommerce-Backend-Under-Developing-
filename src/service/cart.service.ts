import { Database } from "Configuration/database.js";
import { CreateCartDto, UpdateCartDto } from "model/cart.model.js";
import { CartRepository } from "repository/cart.repository.js";
import { Logger } from "utils/logger.js";

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

    return await this.repo.create(dto);
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

    const updateCart = { ...existing, ...dto };
    return await this.repo.update(id, updateCart);
  }

  async deleteCart(id: number) {
    const existing = await this.repo.findById(id);
    if (!existing) {
      this.logger.warn(`Delete Failed: Cart ${id} not found`);
    }
    await this.repo.delete(id);
  }

  async getAllCarts() {
    return await this.repo.findAll();
  }

  async getCartById(id: number) {
    const cart = await this.repo.findById(id);
    if (!cart) this.logger.warn(`Cart ${id} not found`);

    return cart;
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
