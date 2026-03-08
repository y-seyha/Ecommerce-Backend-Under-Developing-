import { Database } from "Configuration/database.js";
import { Cart } from "model/cart.model.js";

export class CartRepository {
  private pool = Database.getInstance();

  async create(cart: Cart) {
    const { rows } = await this.pool.query(
      `INSERT INTO carts (user_id) 
      VALUES ($1) RETURNING *`,
      [cart.user_id],
    );
    return rows[0];
  }

  async update(id: number, cart: Cart) {
    const { rows } = await this.pool.query(
      `UPDATE carts 
      SET user_id=$1 
      WHERE id=$2 
      RETURNING *`,
      [cart.user_id, id],
    );

    return rows[0];
  }

  async delete(id: number) {
    await this.pool.query(`DELETE FROM carts WHERE id=$1`, [id]);
  }

  async findAll() {
    const { rows } = await this.pool.query(
      `
    SELECT
        c.id AS cart_id,
        u.id AS user_id,
        u.first_name,
        u.last_name,
        u.email,
        ci.id AS cart_item_id,
        ci.quantity,
        p.id AS product_id,
        p.name AS product_name,
        p.price AS product_price,
        p.stock AS product_stock,
        p.image_url AS product_image
    FROM carts c
    LEFT JOIN users u ON c.user_id = u.id
    LEFT JOIN cart_items ci ON ci.cart_id = c.id
    LEFT JOIN products p ON ci.product_id = p.id
    ORDER BY c.id, ci.id
    `,
    );

    // Transform flat rows into structured carts with nested items
    const cartsMap = new Map<number, any>();

    for (const row of rows) {
      if (!cartsMap.has(row.cart_id)) {
        cartsMap.set(row.cart_id, {
          id: row.cart_id,
          user: {
            id: row.user_id,
            first_name: row.first_name,
            last_name: row.last_name,
            email: row.email,
          },
          items: [],
        });
      }

      if (row.cart_item_id) {
        cartsMap.get(row.cart_id).items.push({
          id: row.cart_item_id,
          product: {
            id: row.product_id,
            name: row.product_name,
            price: row.product_price,
            stock: row.product_stock,
            image: row.product_image,
          },
          quantity: row.quantity,
        });
      }
    }

    return Array.from(cartsMap.values());
  }

  async findById(id: number) {
    const { rows } = await this.pool.query(
      `SELECT * FROM carts 
        WHERE id=$1`,
      [id],
    );
    return rows[0] ?? null;
  }

  async findAllPaginated(page: number, pageSize: number) {
    const offset = (page - 1) * pageSize;

    const { rows: data } = await this.pool.query(
      `SELECT * FROM carts ORDER BY id LIMIT $1 OFFSET $2`,
      [pageSize, offset],
    );

    const { rows } = await this.pool.query(`SELECT COUNT(*) FROM carts`);
    const total = parseInt(rows[0].count, 10);

    return {
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }
}
