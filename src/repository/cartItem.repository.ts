import { Database } from "Configuration/database.js";
import { CartItem } from "model/cartItem.model.js";

export class CartItemRepository {
  private pool = Database.getInstance();

  async create(item: CartItem) {
    const { rows } = await this.pool.query(
      `INSERT INTO cart_items (cart_id, product_id, quantity) 
      VALUES ($1, $2, $3) 
      RETURNING *`,
      [item.cart_id, item.product_id, item.quantity],
    );
    return rows[0];
  }

  async findAll() {
    const { rows } = await this.pool.query(
      `SELECT * FROM cart_items 
      ORDER BY id`,
    );
    return rows;
  }

  async findById(id: number) {
    const { rows } = await this.pool.query(
      `SELECT * FROM cart_items 
      WHERE id=$1`,
      [id],
    );
    return rows[0];
  }

  async update(id: number, item: CartItem) {
    const { rows } = await this.pool.query(
      `UPDATE cart_items 
      SET cart_id=$1, product_id=$2, quantity=$3 
      WHERE id=$4 
      RETURNING *`,
      [item.cart_id, item.product_id, item.quantity, id],
    );
    return rows[0];
  }

  async delete(id: number) {
    await this.pool.query(
      `DELETE FROM cart_items 
        WHERE id=$1`,
      [id],
    );
  }

  async findAllPaginated(page: number, pageSize: number) {
  const offset = (page - 1) * pageSize;

  const { rows: data } = await this.pool.query(
    `SELECT * FROM cart_items ORDER BY id LIMIT $1 OFFSET $2`,
    [pageSize, offset],
  );

  const { rows } = await this.pool.query(`SELECT COUNT(*) FROM cart_items`);
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
