import { CartItemRepository } from "repository/cartItem.repository.js";
import { CreateCartItemDto, UpdateCartItemDto } from "../dto/cartItem.dto.js";
import { Logger } from "utils/logger.js";
import { Database } from "Configuration/database.js";
import redisClient from "Configuration/redis.js";
import { stringify } from "node:querystring";
import { CartRepository } from "repository/cart.repository.js";

export class CartItemService {
  private repo = new CartItemRepository();
  private cartRepo = new CartRepository();
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

    const cartItem = await this.repo.create(dto);

    try {
      const cacheKey = `cartItem:${cartItem.id}`;
      await redisClient.setEx(cacheKey, 24 * 60 * 60, JSON.stringify(cartItem));
      await redisClient.del(`cartItems:cart:${dto.cart_id}`);
    } catch (error) {
      this.logger.warn("CartItem Service Failed : Redis Error", error);
    }

    return cartItem;
  }

  async updateCartItem(id: number, dto: UpdateCartItemDto) {
    const existing = await this.repo.findById(id);
    if (!existing) {
      this.logger.warn(`Update Failed: CartItem ${id} not found`);
      throw new Error(`CartItem ${id} does not exist`);
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
    const result = await this.repo.update(id, updatedItem);

    try {
      const oldCartId = existing.cart_id;
      const newCartId = result.cart_id;

      if (oldCartId !== newCartId) {
        await redisClient.del(`cartItems:cart:${oldCartId}`);
      }

      const cacheKey = `cartItem:${id}`;
      await redisClient.setEx(cacheKey, 24 * 60 * 60, stringify(result));
      // invalidate all items cache for this cart
      await redisClient.del(`cartItems:cart:${newCartId}`);
    } catch (error) {
      this.logger.info("CartItem Service: Redis Erro", error);
    }
  }

  async deleteCartItem(id: number) {
    const existing = await this.repo.findById(id);
    if (!existing) {
      this.logger.warn(`Delete Failed: CartItem ${id} not found`);
      throw new Error(`CartItem ${id} does not exist`);
    }
    await this.repo.delete(id);

    try {
      const cacheKey = `cartItem:${id}`;
      await redisClient.del(cacheKey);

      await redisClient.del(`cartItems:cart:${existing.cart_id}`);
    } catch (error) {
      this.logger.error("Redis error on deteteCartItem", error);
    }
  }

  async getAllCartItems() {
    return await this.repo.findAll();
  }

  async getCartItemById(id: number) {
    const cacheKey = `cartItem:${id}`;

    try {
      const cached = await redisClient.get(cacheKey);
      if (cached) return JSON.parse(cached);

      const rows = await this.repo.findById(id);
      const item = rows[0];

      if (!item) {
        this.logger.warn(`CartItem ${id} not found`);
        throw new Error(`CartItem ${id} does not exist`);
      }

      await redisClient.setEx(cacheKey, 24 * 60 * 60, JSON.stringify(item));
    } catch (error) {
      this.logger.error("Redis error in getCartItemById", error);
      return await this.repo.findById(id);
    }
  }

  async getCartItemPaginated(page: number, pageSize: number) {
    try {
      return await this.repo.findAllPaginated(page, pageSize);
    } catch (error) {
      this.logger.error("Cart Item Service: GetPaginated Failed", error);
      throw error;
    }
  }

  //getItems by Cart ID
  async getItemsByCartId(cartId: number) {
    const cacheKey = `cartItems:cart:${cartId}`;
    try {
      const cached = await redisClient.get(cacheKey);
      if (cached) return JSON.parse(cached);

      const items = await this.cartRepo.findById(cartId);

      await redisClient.setEx(cacheKey, 24 * 60 * 60, JSON.stringify(items));
      return items;
    } catch (err) {
      this.logger.error("Redis Error in getItemsByCartId", err);
      return await this.cartRepo.findById(cartId);
    }
  }
}
