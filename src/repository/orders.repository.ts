import { Database } from "Configuration/database.js";
import { CreateOrderDTO, UpdateOrderDTO } from "dto/orders.dto.js";
import { Order } from "model/orders.model.js";
import { string } from "zod";

export class OrderRepository {
  private pool = Database.getInstance();

  async insert(order: CreateOrderDTO): Promise<Order> {
    const result = await this.pool.query(
      `INSERT INTO orders (user_id, total_price, status)
       VALUES ($1, $2, $3) RETURNING *`,
      [order.user_id, order.total_price, order.status || "pending"],
    );
    return result.rows[0];
  }

  async update(id: number, data: UpdateOrderDTO): Promise<Order | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let i = 1;

    if (data.total_price !== undefined) {
      fields.push(`total_price = $${i++}`);
      values.push(data.total_price);
    }

    if (data.status) {
      fields.push(`status = $${i++}`);
      values.push(data.status);
    }

    if (fields.length === 0) {
      return this.findById(id);
    }
    values.push(id);
    const query = `
    UPDATE orders 
    SET ${fields.join(", ")}, updated_at = CURRENT_TIMESTAMP 
    WHERE id = $${i} 
    RETURNING *`;

    const result = await this.pool.query(query, values);
    return result.rows[0] || null;
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.pool.query(`DELETE FROM orders WHERE id = $1`, [
      id,
    ]);

    // rowCount might be null
    const rowCount = result.rowCount ?? 0;
    return rowCount > 0;
  }

  async findById(id: number): Promise<Order | null> {
    const result = await this.pool.query(`SELECT * FROM orders WHERE id = $1`, [
      id,
    ]);
    return result.rows[0] || null;
  }

  async findAll(): Promise<Order[]> {
    const result = await this.pool.query(
      `SELECT * FROM orders 
      ORDER BY created_at DESC`,
    );
    return result.rows;
  }
}
