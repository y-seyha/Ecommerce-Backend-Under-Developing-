import { Database } from "Configuration/database.js";
import {
  CreateReviewDTO,
  Review,
  UpdateReviewDTO,
} from "model/review.model.js";

export class ReviewRepository {
  private pool = Database.getInstance();

  async insert(dto: CreateReviewDTO): Promise<Review> {
    const result = await this.pool.query(
      `INSERT INTO reviews (user_id, product_id, rating, comment)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [dto.user_id, dto.product_id, dto.rating, dto.comment || null],
    );
    return result.rows[0];
  }

  async update(id: number, dto: UpdateReviewDTO): Promise<Review | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let i = 1;

    if (dto.rating !== undefined) {
      fields.push(`rating = $${i++}`);
      values.push(dto.rating);
    }
    if (dto.comment) {
      fields.push(`comment = $${i++}`);
      values.push(dto.comment);
    }
    if (fields.length === 0) return this.findById(id);
    values.push(id);
    const query = `
      UPDATE reviews SET ${fields.join(", ")}, created_at = CURRENT_TIMESTAMP
      WHERE id = $${i} RETURNING *`;
    const result = await this.pool.query(query, values);
    return result.rows[0] || null;
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.pool.query(`DELETE FROM reviews WHERE id = $1`, [
      id,
    ]);
    return (result.rowCount ?? 0) > 0;
  }

  async findById(id: number): Promise<Review | null> {
    const result = await this.pool.query(
      `SELECT * FROM reviews WHERE id = $1`,
      [id],
    );
    return result.rows[0] || null;
  }

  async findAll(): Promise<Review[]> {
    const result = await this.pool.query(
      `SELECT * FROM reviews ORDER BY created_at DESC`,
    );
    return result.rows;
  }

  async findByProductId(product_id: number): Promise<Review[]> {
    const result = await this.pool.query(
      `SELECT * FROM reviews WHERE product_id = $1 ORDER BY created_at DESC`,
      [product_id],
    );
    return result.rows;
  }

  async findByUserId(user_id: number): Promise<Review[]> {
    const result = await this.pool.query(
      `SELECT * FROM reviews WHERE user_id = $1 ORDER BY created_at DESC`,
      [user_id],
    );
    return result.rows;
  }

  async findAllPaginated(page: number, pageSize: number) {
    const offset = (page - 1) * pageSize;
    const totalRes = await this.pool.query(`SELECT COUNT(*) FROM reviews`);
    const total = parseInt(totalRes.rows[0].count, 10);

    const dataRes = await this.pool.query(
      `SELECT * FROM reviews ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
      [pageSize, offset],
    );

    return { data: dataRes.rows, total, page, pageSize };
  }
}
