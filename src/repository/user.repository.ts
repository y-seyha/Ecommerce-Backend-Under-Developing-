import { Pool } from "pg";
import { Database } from "Configuration/database.js";
import { IUser } from "model/user.model.js";

export class UserRepository {
  private db: Pool;

  constructor() {
    this.db = Database.getInstance();
  }

  async create(user: Omit<IUser, "id">): Promise<IUser> {
    const result = await this.db.query(
      `INSERT INTO users(first_name,last_name,email,password,role)
       VALUES($1,$2,$3,$4,$5) RETURNING *`,
      [user.first_name, user.last_name, user.email, user.password, user.role],
    );

    return result.rows[0];
  }

  async findAll(): Promise<IUser[]> {
    const res = await this.db.query(`SELECT * FROM users`);
    return res.rows;
  }

  async findById(id: number): Promise<IUser> {
    const res = await this.db.query(
      `SELECT * FROM users
        WHERE id=$1`,
      [id],
    );
    return res.rows[0];
  }

  async findByEmail(email: string): Promise<IUser> {
    const res = await this.db.query(
      `SELECT * FROM users
        WHERE email=$1`,
      [email],
    );
    return res.rows[0];
  }

  async update(id: number, user: IUser): Promise<IUser> {
    const result = await this.db.query(
      `UPDATE users
       SET first_name=$1,last_name=$2,email=$3,password=$4,role=$5,updated_at=NOW()
       WHERE id=$6 RETURNING *`,
      [
        user.first_name,
        user.last_name,
        user.email,
        user.password,
        user.role,
        id,
      ],
    );

    return result.rows[0];
  }

  async delete(id: number) {
    await this.db.query(`DELETE FROM users WHERE id=$1`, [id]);
  }
}
