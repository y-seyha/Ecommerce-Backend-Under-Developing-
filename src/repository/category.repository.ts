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
    const { rows } = await this.pool.query(
      `SELECT * FROM categories ORDER BY id`,
    );
    return rows;
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
