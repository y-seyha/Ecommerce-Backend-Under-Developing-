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
    if (!orderRows.length) {
      this.logger.warn(
        `Create OrderItem Failed: Order ${dto.order_id} not found`,
      );
      throw new Error("Order does not exist");
    }

    const { rows: productRows } = await this.pool.query(
      `SELECT id FROM products WHERE id=$1`,
      [dto.product_id],
    );
    if (!productRows.length) {
      this.logger.warn(
        `Create OrderItem Failed: Product ${dto.product_id} not found`,
      );
      throw new Error("Product does not exist");
    }

    if (dto.quantity <= 0 || dto.price <= 0) {
      this.logger.warn(`Create OrderItem Failed: Invalid quantity or price`);
      throw new Error("Quantity and price must be greater than 0");
    }

    const item = await this.repo.insert(dto);

      try {
      const cacheKey = `orderItem:${item.id}`;
      await redisClient.setEx(cacheKey, 24 * 60 * 60, JSON.stringify(item));
    } catch (error) {
      this.logger.warn("OrderItem Service: Redis Error on createOrderItem", error);
      throw new Error("Cannot Create Order")
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
      this.logger.warn("Order Item Service: Redis Error on updateOrderItem", error);
      throw new Error("Cannout update cart items")
    }

    return updated; 
  }

  async deleteOrderItem(id: number) {
    const existing = await this.repo.findById(id);
    if (!existing) {
      this.logger.warn(`Delete OrderItem Failed: Item ${id} not found`);
      return false;
    }
    const deleted =  await this.repo.delete(id);
      try {
      const cacheKey = `orderItem:${id}`;
      await redisClient.del(cacheKey);
    } catch (error) {
      this.logger.warn("OrderItem service: Redis Error on deleteOrderItem", error);
      throw new Error(`Order Items ${id} not found`)
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

      await redisClient.setEx(
        cacheKey,
        24 * 60 * 60,
        JSON.stringify(items)
      );

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
