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
    const { rows } = await this.pool.query(`SELECT * FROM carts ORDER BY id`);
    return rows;
  }

  async findById(id: number) {
    const { rows } = await this.pool.query(
      `SELECT * FROM carts 
        WHERE id=$1`,
      [id],
    );
    return rows[0];
  }
}
