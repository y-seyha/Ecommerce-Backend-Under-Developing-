import { Database } from "Configuration/database.js";
import { Categories } from "model/category.model.js";

export class CategoryRepository {
  private pool = Database.getInstance();

  async create(category: Categories) {
    const { name, description } = category;
    const { rows } = await this.pool.query(
      `INSERT INTO categories (name, description) 
      VALUES ($1, $2) 
      RETURNING *`,
      [name, description],
    );

    return rows[0];
  }

  async update(id: number, category: Categories) {
    const { name, description } = category;
    const { rows } = await this.pool.query(
      `UPDATE categories 
      SET name=$1, description=$2, updated_at=NOW() 
      WHERE id=$3 
      RETURNING *`,
      [name, description, id],
    );

    return rows[0];
  }

  async delete(id: number) {
    await this.pool.query(
      `DELETE FROM categories
         WHERE id=$1`,
      [id],
    );
  }

  async getAll() {
    const { rows } = await this.pool.query(`
    SELECT
      c.id AS category_id,
      c.name AS category_name,
      c.description AS category_description,
      c.created_at AS category_created_at,
      c.updated_at AS category_updated_at,
      p.id AS product_id,
      p.name AS product_name,
      p.description AS product_description,
      p.price AS product_price,
      p.stock AS product_stock,
      p.image_url AS product_image,
      p.image_public_id AS product_public_id,
      p.created_at AS product_created_at,
      p.updated_at AS product_updated_at
    FROM categories c
    LEFT JOIN products p ON p.category_id = c.id
    ORDER BY c.id, p.id
  `);

    // Transform flat rows into structured categories with nested products
    const categoriesMap = new Map<number, any>();

    for (const row of rows) {
      if (!categoriesMap.has(row.category_id)) {
        categoriesMap.set(row.category_id, {
          id: row.category_id,
          name: row.category_name,
          description: row.category_description,
          created_at: row.category_created_at,
          updated_at: row.category_updated_at,
          products: [],
        });
      }

      if (row.product_id) {
        categoriesMap.get(row.category_id).products.push({
          id: row.product_id,
          name: row.product_name,
          description: row.product_description,
          price: row.product_price,
          stock: row.product_stock,
          image_url: row.product_image,
          image_public_id: row.product_public_id,
          created_at: row.product_created_at,
          updated_at: row.product_updated_at,
        });
      }
    }

    return Array.from(categoriesMap.values());
  }

  async findById(id: number) {
    const { rows } = await this.pool.query(
      `SELECT * FROM categories 
      WHERE id=$1`,
      [id],
    );
    return rows[0];
  }
}
