import { Database } from "Configuration/database.js";
import {
  OrderItem,
  CreateOrderItemDTO,
  UpdateOrderItemDTO,
} from "../model/orderItem.model.js";

export class OrderItemRepository {
  private db = Database.getInstance();

  async insert(dto: CreateOrderItemDTO): Promise<OrderItem> {
    const result = await this.db.query(
      `INSERT INTO order_items (order_id, product_id, quantity, price)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [dto.order_id, dto.product_id, dto.quantity, dto.price],
    );
    return result.rows[0];
  }

  async findById(id: number): Promise<OrderItem | null> {
    const result = await this.db.query(
      `SELECT * FROM order_items WHERE id=$1`,
      [id],
    );
    return result.rows[0] || null;
  }

  async findAll(): Promise<OrderItem[]> {
    const result = await this.db.query(
      `SELECT * FROM order_items ORDER BY created_at DESC`,
    );
    return result.rows;
  }

  async findByOrderId(order_id: number): Promise<OrderItem[]> {
    const result = await this.db.query(
      `SELECT * FROM order_items WHERE order_id=$1`,
      [order_id],
    );
    return result.rows;
  }

  async update(id: number, dto: UpdateOrderItemDTO): Promise<OrderItem | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (dto.quantity !== undefined) {
      fields.push(`quantity = $${idx++}`);
      values.push(dto.quantity);
    }
    if (dto.price !== undefined) {
      fields.push(`price = $${idx++}`);
      values.push(dto.price);
    }

    if (!fields.length) return this.findById(id);

    values.push(id);
    const query = `UPDATE order_items SET ${fields.join(", ")}, updated_at = CURRENT_TIMESTAMP WHERE id=$${idx} RETURNING *`;
    const result = await this.db.query(query, values);
    return result.rows[0] || null;
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.db.query(`DELETE FROM order_items WHERE id=$1`, [
      id,
    ]);
    const rowCount = result.rowCount ?? 0;
    return rowCount > 0;
  }
}
