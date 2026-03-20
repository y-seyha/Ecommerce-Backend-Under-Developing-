import { Database } from "Configuration/database.js";
import redisClient from "Configuration/redis.js";
import { CreateOrderDTO, UpdateOrderDTO } from "dto/orders.dto.js";

import { OrderItemRepository } from "repository/orderItem.repository.js";
import { OrderRepository } from "repository/orders.repository.js";
import { PaymentRepository } from "repository/payment.repository.js";
import { ProductRepository } from "repository/product.repository.js";
import { Logger } from "utils/logger.js";

type OrderInsert = Omit<CreateOrderDTO, "items" | "payment_method">;

export class OrderService {
  private repo = new OrderRepository();
  private logger = Logger.getInstance();
  private pool = Database.getInstance();
  private orderItemRepo = new OrderItemRepository();
  private paymentRepo = new PaymentRepository();
  private productRepo = new ProductRepository();

  async createOrder(dto: CreateOrderDTO) {
    if (!dto.items || !dto.items.length)
      throw new Error("Order must include at least one item");

    // 1. Insert order first
    const order = await this.repo.insert(dto);

    // 2. Insert order items
    const orderItems = await this.orderItemRepo.insert(order.id, dto.items);

    // 3. SAFE stock deduction
    for (const item of dto.items) {
      const updated = await this.productRepo.decreaseStock(
        item.product_id,
        item.quantity,
      );

      if (!updated) {
        throw new Error(`Not enough stock for product ${item.product_id}`);
      }
    }

    // 4. Insert payment
    const payment = await this.paymentRepo.insert({
      order_id: order.id,
      amount: dto.total_price,
      method: dto.payment_method || "cod",
    });

    return {
      order,
      items: orderItems,
      payment,
    };
  }

  async updateOrder(id: number, dto: UpdateOrderDTO) {
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

    const updated = await this.repo.update(id, dto);

    try {
      const cacheKey = `order:${id}`;
      await redisClient.setEx(cacheKey, 24 * 60 * 60, JSON.stringify(updated));
    } catch (error) {
      this.logger.warn("Order Service: Redis error", error);
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
