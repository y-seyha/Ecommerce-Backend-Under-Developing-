import { Database } from "Configuration/database.js";
import {
  OrderItem,
  CreateOrderItemDTO,
  UpdateOrderItemDTO,
} from "../model/orderItem.model.js";

export class OrderItemRepository {
  private db = Database.getInstance();

  async insert(
    order_id: number,
    items: { product_id: number; quantity: number; price: number }[],
  ) {
    const insertedItems: OrderItem[] = [];
    for (const item of items) {
      const { rows } = await this.db.query(
        `INSERT INTO order_items (order_id, product_id, quantity, price)
         VALUES ($1,$2,$3,$4) RETURNING *`,
        [order_id, item.product_id, item.quantity, item.price],
      );
      insertedItems.push(rows[0]);
    }
    return insertedItems;
  }

  async findById(id: number): Promise<OrderItem | null> {
    const result = await this.db.query(
      `SELECT * FROM order_items WHERE id=$1`,
      [id],
    );
    return result.rows[0] || null;
  }

  async findAll(): Promise<any[]> {
    const { rows } = await this.db.query(`
    SELECT
        oi.id AS order_item_id,
        oi.quantity AS item_quantity,
        oi.price AS item_price,
        o.id AS order_id,
        o.total_price AS order_total_price,
        o.status AS order_status,
        o.created_at AS order_created_at,
        u.id AS user_id,
        u.first_name,
        u.last_name,
        u.email,
        p.id AS product_id,
        p.name AS product_name,
        p.price AS product_price,
        p.stock AS product_stock,
        p.image_url AS product_image
    FROM order_items oi
    LEFT JOIN orders o ON oi.order_id = o.id
    LEFT JOIN users u ON o.user_id = u.id
    LEFT JOIN products p ON oi.product_id = p.id
    ORDER BY oi.created_at DESC
  `);

    // Transform flat rows into structured order items with nested order and product info
    return rows.map((row) => ({
      id: row.order_item_id,
      quantity: row.item_quantity,
      price: row.item_price,
      order: {
        id: row.order_id,
        total_price: row.order_total_price,
        status: row.order_status,
        created_at: row.order_created_at,
        user: {
          id: row.user_id,
          first_name: row.first_name,
          last_name: row.last_name,
          email: row.email,
        },
      },
      product: {
        id: row.product_id,
        name: row.product_name,
        price: row.product_price,
        stock: row.product_stock,
        image: row.product_image,
      },
    }));
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

  async findAllPaginated(page: number, pageSize: number) {
    const offset = (page - 1) * pageSize;
    const totalRes = await this.db.query(`SELECT COUNT(*) FROM cart_items`);
    const total = parseInt(totalRes.rows[0].count, 10);

    const dataRes = await this.db.query(
      `SELECT * FROM cart_items ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
      [pageSize, offset],
    );

    return { data: dataRes.rows, total, page, pageSize };
  }
}
