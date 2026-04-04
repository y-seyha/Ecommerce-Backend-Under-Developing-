import { NextFunction, Request, Response } from "express";
import { UserRole, IUser } from "model/user.model.js";
import jwt from "jsonwebtoken";
import { Database } from "../Configuration/database.js";
import { Logger } from "../utils/logger.js";

const logger = Logger.getInstance();
const pool = Database.getInstance();

interface JwtPayload {
  userId: string;
  role: UserRole;
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token = req.cookies?.accessToken;
    if (!token) {
      logger.warn(`Unauthorized: No access token, ${req.method} ${req.url}`);
      return res.status(401).json({ message: "Unauthorized" });
    }

    // ✅ Use the correct access token secret
    const decoded = jwt.verify(
      token,
      process.env.JWT_ACCESS_SECRET!,
    ) as JwtPayload;

    // Fetch full user from DB
    const userResult = await pool.query<IUser>(
      "SELECT id, email, first_name, last_name, role, phone, avatar_url, is_verified, created_at, updated_at FROM users WHERE id = $1",
      [decoded.userId],
    );

    const user = userResult.rows[0];
    if (!user) {
      logger.warn(`Unauthorized: User not found, id=${decoded.userId}`);
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Attach user to request
    const role = (user.role as string).toLowerCase() as UserRole;
    console.log(role, "Role");

    req.user = { ...user, role };

    logger.info(`Authenticated user=${user.id}, ${req.method} ${req.url}`);
    next();
  } catch (err: any) {
    logger.warn(`Invalid token: ${err.message}`);
    return res.status(401).json({ message: "Unauthorized" });
  }
};
