import { Database } from "Configuration/database.js";
import { OrderItemRepository } from "../repository/orderItem.repository.js";
import { Logger } from "utils/logger.js";
import {
  CreateOrderItemDTO,
  UpdateOrderItemDTO,
} from "../model/orderItem.model.js";
import redisClient from "Configuration/redis.js";

export class OrderItemService {
  private repo = new OrderItemRepository();
  private logger = Logger.getInstance();
  private pool = Database.getInstance();

  async createOrderItem(dto: CreateOrderItemDTO) {
    const { rows: orderRows } = await this.pool.query(
      `SELECT id FROM orders WHERE id=$1`,
      [dto.order_id],
    );
    if (!orderRows.length) throw new Error("Order does not exist");

    const { rows: productRows } = await this.pool.query(
      `SELECT id, price FROM products WHERE id=$1`,
      [dto.product_id],
    );
    if (!productRows.length) throw new Error("Product does not exist");

    if (dto.quantity <= 0) throw new Error("Quantity must be greater than 0");

    // Check if product already exists in this order
    const { rows: existingRows } = await this.pool.query(
      `SELECT id, quantity FROM order_items WHERE order_id=$1 AND product_id=$2`,
      [dto.order_id, dto.product_id],
    );

    let item;
    if (existingRows.length) {
      // Update existing quantity
      const newQuantity = existingRows[0].quantity + dto.quantity;
      const { rows: updatedRows } = await this.pool.query(
        `UPDATE order_items SET quantity=$1, price=$2, updated_at=NOW() WHERE id=$3 RETURNING *`,
        [newQuantity, productRows[0].price * newQuantity, existingRows[0].id],
      );
      item = updatedRows[0];
    } else {
      // Insert new row
      const { rows: insertedRows } = await this.pool.query(
        `INSERT INTO order_items (order_id, product_id, quantity, price, created_at, updated_at)
       VALUES ($1, $2, $3, $4, NOW(), NOW()) RETURNING *`,
        [
          dto.order_id,
          dto.product_id,
          dto.quantity,
          productRows[0].price * dto.quantity,
        ],
      );
      item = insertedRows[0];
    }

    // Update Redis cache
    try {
      const cacheKey = `orderItem:${item.id}`;
      await redisClient.setEx(cacheKey, 24 * 60 * 60, JSON.stringify(item));
    } catch (error) {
      this.logger.warn("Redis Error on create/updateOrderItem", error);
    }

    return item;
  }

  async updateOrderItem(id: number, dto: UpdateOrderItemDTO) {
    const existing = await this.repo.findById(id);
    if (!existing) {
      this.logger.warn(`Update OrderItem Failed: Item ${id} not found`);
      throw new Error("OrderItem does not exist");
    }

    const updated = await this.repo.update(id, dto);
    try {
      const cacheKey = `orderItem:${id}`;
      await redisClient.setEx(cacheKey, 24 * 60 * 60, JSON.stringify(updated));
    } catch (error) {
      this.logger.warn(
        "Order Item Service: Redis Error on updateOrderItem",
        error,
      );
      throw new Error("Cannout update cart items");
    }

    return updated;
  }

  async deleteOrderItem(id: number) {
    const existing = await this.repo.findById(id);
    if (!existing) {
      this.logger.warn(`Delete OrderItem Failed: Item ${id} not found`);
      return false;
    }
    const deleted = await this.repo.delete(id);
    try {
      const cacheKey = `orderItem:${id}`;
      await redisClient.del(cacheKey);
    } catch (error) {
      this.logger.warn(
        "OrderItem service: Redis Error on deleteOrderItem",
        error,
      );
      throw new Error(`Order Items ${id} not found`);
    }

    return deleted;
  }

  async getAllOrderItems() {
    return await this.repo.findAll();
  }

  async getOrderItemById(id: number) {
    const cacheKey = `orderItem:${id}`;

    try {
      const cached = await redisClient.get(cacheKey);
      if (cached) return JSON.parse(cached);

      const item = await this.repo.findById(id);
      if (!item) {
        this.logger.warn(`OrderItem ${id} not found`);
        return null;
      }

      await redisClient.setEx(cacheKey, 24 * 60 * 60, JSON.stringify(item));
      return item;
    } catch (error) {
      this.logger.warn("Redis Error in getOrderItemById", error);
      const item = await this.repo.findById(id);
      if (!item) this.logger.warn(`OrderItem ${id} not found`);
      return item;
    }
  }

  async getItemsByOrderId(order_id: number) {
    const cacheKey = `orderItems:order:${order_id}`;

    try {
      const cached = await redisClient.get(cacheKey);
      if (cached) return JSON.parse(cached);

      const items = await this.repo.findByOrderId(order_id);

      await redisClient.setEx(cacheKey, 24 * 60 * 60, JSON.stringify(items));

      return items;
    } catch (error) {
      this.logger.warn("Redis Error in getItemsByOrderId", error);
      return await this.repo.findByOrderId(order_id);
    }
  }

  async getOrderItemPaginated(page: number, pageSize: number) {
    try {
      return await this.repo.findAllPaginated(page, pageSize);
    } catch (error) {
      this.logger.error("Order Item Service: GetPaginated Failed", error);
      throw error;
    }
  }
}
