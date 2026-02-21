import { Database } from "Configuration/database.js";
import { OrderItemRepository } from "../repository/orderItem.repository.js";
import { Logger } from "utils/logger.js";
import {
  CreateOrderItemDTO,
  UpdateOrderItemDTO,
} from "../model/orderItem.model.js";

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

    return await this.repo.insert(dto);
  }

  async updateOrderItem(id: number, dto: UpdateOrderItemDTO) {
    const existing = await this.repo.findById(id);
    if (!existing) {
      this.logger.warn(`Update OrderItem Failed: Item ${id} not found`);
      throw new Error("OrderItem does not exist");
    }

    return await this.repo.update(id, dto);
  }

  async deleteOrderItem(id: number) {
    const existing = await this.repo.findById(id);
    if (!existing) {
      this.logger.warn(`Delete OrderItem Failed: Item ${id} not found`);
      return false;
    }
    return await this.repo.delete(id);
  }

  async getAllOrderItems() {
    return await this.repo.findAll();
  }

  async getOrderItemById(id: number) {
    const item = await this.repo.findById(id);
    if (!item) this.logger.warn(`OrderItem ${id} not found`);
    return item;
  }

  async getItemsByOrderId(order_id: number) {
    return await this.repo.findByOrderId(order_id);
  }
}
