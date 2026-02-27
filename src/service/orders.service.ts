import { Database } from "Configuration/database.js";
import redisClient from "Configuration/redis.js";
import { CreateOrderDTO, UpdateOrderDTO } from "dto/orders.dto.js";
import { rawListeners } from "node:cluster";
import { OrderRepository } from "repository/orders.repository.js";
import { Logger } from "utils/logger.js";

export class OrderService {
  private repo = new OrderRepository();
  private logger = Logger.getInstance();
  private pool = Database.getInstance();

  async createOrder(dto: CreateOrderDTO) {
    const { rows } = await this.pool.query(`SELECT * FROM users WHERE id=$1`, [
      dto.user_id,
    ]);

    if (!rows.length) {
      this.logger.warn(`Create Order Failed: User ${dto.user_id} not found`);
      throw new Error("User does not exist");
    }

    if (dto.total_price <= 0) {
      this.logger.warn(
        `Create Order Failed: Invalid total price ${dto.total_price}`,
      );
      throw new Error("Total price must be greater than 0");
    }

    const order = await this.repo.insert(dto);

    try {
      const cacheKey = `order:${order.id}`;
      await redisClient.setEx(cacheKey, 24 * 60 * 60, JSON.stringify(order));
    } catch (error) {
      this.logger.warn("Order Service: Redis failed", error);
      throw new Error("Order Service: Cannot Create Order");
    }
    return rows[0];
  }

  async updateOder(id: number, dto: UpdateOrderDTO) {
    const existing = await this.repo.findById(id);
    if (!existing) {
      this.logger.warn(`Update Order Failed: Order ${id} not found`);
      throw new Error("Order does not exist");
    }

    if (dto.user_id) {
      const { rows } = await this.pool.query(
        `SELECT id FROM users WHERE id=$1`,
        [dto.user_id],
      );
      if (!rows.length) {
        this.logger.warn(`Update Order Failed: User ${dto.user_id} not found`);
        throw new Error("User does not exist");
      }
    }

    const updateOrder = { ...existing, ...dto };
    const updated = await this.repo.update(id, updateOrder);

    try {
      const cacheKey = `order:${id}`;
      await redisClient.setEx(cacheKey, 24 * 60 * 60, JSON.stringify(updated));
    } catch (error) {
      this.logger.warn("Order service: Redis error", error);
      throw new Error("Order service: Cannot Update Order");
    }
    return updated;
  }

  async deleteOrder(id: number) {
    const existing = await this.repo.findById(id);
    if (!existing) {
      this.logger.warn(`Delete Order Failed: Order ${id} not found`);
      return false;
    }

    const deleted = await this.repo.delete(id);

    try {
      const cacheKey = `order:${id}`;
      await redisClient.del(cacheKey);
    } catch (error) {
      this.logger.error("Order Service: Redis Error on deleteOrder", error);
      throw new Error("Order Service: Cannot delete order");
    }

    return deleted;
  }

  async getAllOrders() {
    return await this.repo.findAll();
  }

  async getOrderById(id: number) {
    const cacheKey = `order:${id}`;
    try {
      const cached = await redisClient.get(cacheKey);
      if (cached) return JSON.parse(cached);

      const order = await this.repo.findById(id);
      if (!order) {
        this.logger.warn(`Order ${id} not found`);
        throw new Error("Order not found");
      }

      await redisClient.setEx(cacheKey, 24 * 60 * 60, JSON.stringify(order));
      return order;
    } catch (error) {
      this.logger.warn("Order Service: Redis error", error);
      throw new Error(`Order Service: Cannout getOrderbyID ${id}`);
    }
    const order = await this.repo.findById(id);
    if (!order) this.logger.warn(`Order ${id} not found`);
    return order;
  }

  async getOrderPaginated(page: number, pageSize: number) {
    try {
      return await this.repo.findAllPaginated(page, pageSize);
    } catch (error) {
      this.logger.error("Order Service: GetPaginated Failed", error);
      throw error;
    }
  }
}
