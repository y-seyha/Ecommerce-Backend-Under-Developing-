import { Database } from "Configuration/database.js";
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

    return await this.repo.insert(dto);
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
    return await this.repo.update(id, updateOrder);
  }

  async deleteOrder(id: number) {
    const existing = await this.repo.findById(id);
    if (!existing) {
      this.logger.warn(`Delete Order Failed: Order ${id} not found`);
      return false;
    }

    return await this.repo.delete(id);
  }

  async getAllOrders() {
    return await this.repo.findAll();
  }

  async getOrderById(id: number) {
    const order = await this.repo.findById(id);
    if (!order) this.logger.warn(`Order ${id} not found`);
    return order;
  }
}
