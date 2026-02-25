import { Database } from "../Configuration/database.js";
import { Product } from "model/product.model.js";
import { Logger } from "utils/logger.js";

export class ProductRepository {
  private logger = Logger.getInstance();
  private pool = Database.getInstance();

  async create(product: Product): Promise<Product> {
    const query = `
    INSERT INTO products(name, description, price, stock, category_id)
      VALUES($1,$2,$3,$4,$5)
      RETURNING *;
    `;

    const values = [
      product.name,
      product.description,
      product.price,
      product.stock ?? 0,
      product.category_id,
    ];

    const { rows } = await this.pool.query(query, values);
    return rows[0];
  }

  async findAll(): Promise<Product[]> {
    const { rows } = await this.pool.query(`SELECT * FROM products`);
    return rows;
  }

  async findById(id: number): Promise<Product> {
    const { rows } = await this.pool.query(
      `SELECT * FROM products WHERE id=$1`,
      [id],
    );
    return rows[0];
  }

  async update(id: number, product: Product): Promise<Product> {
    const query = `
    UPDATE products 
    SET name=$1, description=$2, price=$3, stock=$4, category_id=$5, updated_at=CURRENT_TIMESTAMP
    WHERE id=$6
    RETURNING *
    `;

    const values = [
      product.name,
      product.description,
      product.price,
      product.stock,
      product.category_id,
      id,
    ];

    const { rows } = await this.pool.query(query, values);
    return rows[0];
  }

  async delete(id: number): Promise<void> {
    await this.pool.query(`DELETE FROM products WHERE id=$1`, [id]);
  }

  async findAllPaginated(page: number, pageSize: number) {
    const offset = (page - 1) * pageSize;

    const { rows: data } = await this.pool.query(
      `SELECT * FROM products ORDER BY id LIMIT $1 OFFSET $2`,
      [pageSize, offset],
    );

    const { rows } = await this.pool.query(`SELECT COUNT(*) FROM products`);
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
