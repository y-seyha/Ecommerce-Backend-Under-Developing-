import { Database } from "Configuration/database.js";
import { CartItem } from "model/cartItem.model.js";

export class CartItemRepository {
  private pool = Database.getInstance();

  // Create cart item
  async create(item: CartItem) {
    const { rows } = await this.pool.query(
      `INSERT INTO cart_items (cart_id, product_id, quantity) 
       VALUES ($1, $2, $3) 
       RETURNING *`,
      [item.cart_id, item.product_id, item.quantity],
    );
    return rows[0];
  }

  // Get all cart items WITH product info
  async findAll() {
    const { rows } = await this.pool.query(
      `SELECT ci.*, 
              p.name AS product_name, 
              p.price AS product_price, 
              p.image_url AS product_image
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       ORDER BY ci.id`,
    );
    return rows;
  }

  // Find cart item by id WITH product info
  async findById(id: number) {
    const { rows } = await this.pool.query(
      `SELECT ci.*, 
              p.name AS product_name, 
              p.price AS product_price, 
              p.image_url AS product_image
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       WHERE ci.id = $1`,
      [id],
    );
    return rows[0] ?? null;
  }

  // Find all items by cart_id (most important for frontend cart page)
  async findByCartId(cartId: number) {
    const { rows } = await this.pool.query(
      `SELECT ci.*, 
              p.name AS product_name, 
              p.price AS product_price, 
              p.image_url AS product_image
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       WHERE ci.cart_id = $1
       ORDER BY ci.id`,
      [cartId],
    );
    return rows;
  }

  // Update cart item
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

  // Delete cart item
  async delete(id: number) {
    await this.pool.query(`DELETE FROM cart_items WHERE id=$1`, [id]);
  }

  // Paginated cart items WITH product info
  async findAllPaginated(page: number, pageSize: number) {
    const offset = (page - 1) * pageSize;

    const { rows: data } = await this.pool.query(
      `SELECT ci.*, 
              p.name AS product_name, 
              p.price AS product_price, 
              p.image_url AS product_image
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       ORDER BY ci.id
       LIMIT $1 OFFSET $2`,
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
