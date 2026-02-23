import { Database } from "Configuration/database.js";
import { CreatePaymentDTO, UpdatePaymentDTO } from "../dto/payment.dto.js";
import { Payment } from "model/payment.model.js";

export class PaymentRepository {
  private pool = Database.getInstance();

  async insert(dto: CreatePaymentDTO): Promise<Payment> {
    const result = await this.pool.query(
      `INSERT INTO payments (order_id, amount, method, status, paid_at)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [
        dto.order_id,
        dto.amount,
        dto.method,
        dto.status || "pending",
        dto.paid_at || null,
      ],
    );
    return result.rows[0];
  }

  async update(id: number, dto: UpdatePaymentDTO): Promise<Payment | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let i = 1;

    if (dto.amount !== undefined) {
      fields.push(`amount = $${i++}`);
      values.push(dto.amount);
    }
    if (dto.method) {
      fields.push(`method = $${i++}`);
      values.push(dto.method);
    }
    if (dto.status) {
      fields.push(`status = $${i++}`);
      values.push(dto.status);
    }
    if (dto.paid_at) {
      fields.push(`paid_at = $${i++}`);
      values.push(dto.paid_at);
    }

    if (fields.length === 0) return this.findById(id);

    values.push(id);
    const query = `
      UPDATE payments SET ${fields.join(", ")}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${i} RETURNING *`;
    const result = await this.pool.query(query, values);
    return result.rows[0] || null;
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.pool.query(`DELETE FROM payments WHERE id = $1`, [
      id,
    ]);
    return (result.rowCount ?? 0) > 0;
  }

  async findById(id: number): Promise<Payment | null> {
    const result = await this.pool.query(
      `SELECT * FROM payments WHERE id = $1`,
      [id],
    );
    return result.rows[0] || null;
  }

  async findAll(): Promise<Payment[]> {
    const result = await this.pool.query(
      `SELECT * FROM payments ORDER BY created_at DESC`,
    );
    return result.rows;
  }

  async findByOrderId(order_id: number): Promise<Payment[]> {
    const result = await this.pool.query(
      `SELECT * FROM payments WHERE order_id = $1 ORDER BY created_at DESC`,
      [order_id],
    );
    return result.rows;
  }
}
