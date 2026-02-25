import { PaymentRepository } from "../repository/payment.repository.js";
import { CreatePaymentDTO, UpdatePaymentDTO } from "../dto/payment.dto.js";
import { Logger } from "utils/logger.js";
import { Database } from "Configuration/database.js";

export class PaymentService {
  private repo = new PaymentRepository();
  private logger = Logger.getInstance();
  private pool = Database.getInstance();

  async createPayment(dto: CreatePaymentDTO) {
    const { rows } = await this.pool.query(
      `SELECT id FROM orders WHERE id=$1`,
      [dto.order_id],
    );
    if (!rows.length) {
      this.logger.warn(
        `Create Payment Failed: Order ${dto.order_id} not found`,
      );
      throw new Error("Order does not exist");
    }

    if (dto.amount <= 0) {
      this.logger.warn(`Create Payment Failed: Invalid amount ${dto.amount}`);
      throw new Error("Amount must be greater than 0");
    }

    return this.repo.insert(dto);
  }

  async updatePayment(id: number, dto: UpdatePaymentDTO) {
    const existing = await this.repo.findById(id);
    if (!existing) {
      this.logger.warn(`Update Payment Failed: Payment ${id} not found`);
      throw new Error("Payment does not exist");
    }
    if (dto.status === "completed" && !dto.paid_at) {
      dto.paid_at = new Date();
    }

    return this.repo.update(id, dto);
  }

  async deletePayment(id: number) {
    const existing = await this.repo.findById(id);
    if (!existing) {
      this.logger.warn(`Delete Payment Failed: Payment ${id} not found`);
      return false;
    }

    return this.repo.delete(id);
  }

  async getAllPayments() {
    return this.repo.findAll();
  }

  async getPaymentById(id: number) {
    const payment = await this.repo.findById(id);
    if (!payment) this.logger.warn(`Payment ${id} not found`);
    return payment;
  }

  async getPaymentsByOrderId(order_id: number) {
    return this.repo.findByOrderId(order_id);
  }


async getPaymentPaginated(page: number, pageSize: number) {
  try {
    return await this.repo.findAllPaginated(page, pageSize);
  } catch (error) {
    this.logger.error("Payment Service: GetPaginated Failed", error);
    throw error;
  }
}
}
