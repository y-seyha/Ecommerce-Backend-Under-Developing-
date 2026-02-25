import { CartItemRepository } from "repository/cartItem.repository.js";
import { CreateCartItemDto, UpdateCartItemDto } from "../dto/cartItem.dto.js";
import { Logger } from "utils/logger.js";

import { Database } from "Configuration/database.js";

export class CartItemService {
  private repo = new CartItemRepository();
  private logger = Logger.getInstance();
  private pool = Database.getInstance();

  async createCartItem(dto: CreateCartItemDto) {
    const { rows: cartRows } = await this.pool.query(
      `SELECT id FROM carts 
      WHERE id=$1`,
      [dto.cart_id],
    );
    if (!cartRows.length) {
      this.logger.warn(`Create CartItem Failed: Cart ${dto.cart_id} not found`);
    }

    const { rows: productRows } = await this.pool.query(
      `SELECT id FROM products WHERE id=$1`,
      [dto.product_id],
    );
    if (!productRows.length) {
      this.logger.warn(
        `Create CartItem Failed: Product ${dto.product_id} not found`,
      );
    }

    return await this.repo.create(dto);
  }

  async updateCartItem(id: number, dto: UpdateCartItemDto) {
    const existing = await this.repo.findById(id);
    if (!existing) {
      this.logger.warn(`Update Failed: CartItem ${id} not found`);
    }

    if (dto.cart_id) {
      const { rows } = await this.pool.query(
        `SELECT id FROM carts WHERE id=$1`,
        [dto.cart_id],
      );
    }

    if (dto.product_id) {
      const { rows } = await this.pool.query(
        `SELECT id FROM products WHERE id=$1`,
        [dto.product_id],
      );
    }

    const updatedItem = { ...existing, ...dto };
    return await this.repo.update(id, updatedItem);
  }

  async deleteCartItem(id: number) {
    const existing = await this.repo.findById(id);
    if (!existing) {
      this.logger.warn(`Delete Failed: CartItem ${id} not found`);
    }
    await this.repo.delete(id);
  }

  async getAllCartItems() {
    return await this.repo.findAll();
  }

  async getCartItemById(id: number) {
    const item = await this.repo.findById(id);
    if (!item) {
      this.logger.warn(`CartItem ${id} not found`);
    }
    return item;
  }

  async getCartItemPaginated(page: number, pageSize: number) {
    try {
      return await this.repo.findAllPaginated(page, pageSize);
    } catch (error) {
      this.logger.error("Cart Item Service: GetPaginated Failed", error);
      throw error;
    }
  }
}
