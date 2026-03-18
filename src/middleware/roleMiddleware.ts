import { Request, Response, NextFunction } from "express";
import { UserRole, IUser } from "../model/user.model.js";
import { Logger } from "../utils/logger.js";

const logger = Logger.getInstance();

export const authorizeRole = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user as IUser | undefined; // <- cast here

      if (!user) {
        logger.warn(`Unauthorized: no user info for ${req.method} ${req.url}`);
        return res.status(401).json({ message: "Unauthorized: No user info" });
      }

      if (!user.role) {
        logger.warn(`Forbidden: missing role for userId=${user.id}`);
        return res
          .status(403)
          .json({ message: "Forbidden: User role not found" });
      }

      if (!allowedRoles.includes(user.role)) {
        logger.warn(
          `Forbidden: role '${user.role}' not allowed for ${user.id}`,
        );
        return res.status(403).json({
          message: `Forbidden: Role '${user.role}' not allowed to access this resource`,
        });
      }

      next();
    } catch (err: any) {
      logger.error(
        `authorizeRole failed: ${req.method} ${req.url} - ${err.message}`,
      );
      return res.status(500).json({ message: "Internal Server Error" });
    }
  };
};
