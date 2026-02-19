import { Pool } from "pg";
import "dotenv/config";

export class Database {
  private static instance: Pool;

  private constructor() {}

  public static getIntance(): Pool {
    {
      if (!Database.instance) {
        Database.instance = new Pool({
          user: process.env.DB_USER,
          host: process.env.DB_HOST,
          database: process.env.DB_NAME,
          password: process.env.DB_PASSWORD,
          port: Number(process.env.DB_PORT),
        });

        Database.instance
          .connect()
          .then(() => console.log("Connected to PostgresSQL successfully"))
          .catch(() => {
            console.error();
            process.exit(1);
          });
      }

      return Database.instance;
    }
  }
}
