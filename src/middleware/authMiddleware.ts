import { NextFunction, Request, Response } from "express";
import { UserRole } from "model/user.model.js";
import jwt from "jsonwebtoken";
import { Logger } from "../utils/logger.js";

const logger = Logger.getInstance();

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      logger.warn(`Unauthorized request: No token provided, ${req.method} ${req.url}`);
      return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: number; role: UserRole };

    // Attach user info to req.user
    //Only id and role are filled
    req.user = {
      id: decoded.id,
      first_name: "",
      last_name: "",
      email: "",
      password: "",
      role: decoded.role,
    };

    logger.info(`Authenticated request: userId=${decoded.id}, role=${decoded.role}, ${req.method} ${req.url}`);
    next();
  } catch (err: any) {
    logger.warn(`Unauthorized request: Invalid or expired token, ${req.method} ${req.url} - ${err.message}`);
    res.status(401).json({ message: "Unauthorized: Invalid or expired token" });
  }
};