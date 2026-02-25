import { Request, Response, NextFunction } from "express";
import { UserRole } from "model/user.model.js";
import { Logger } from "utils/logger.js";

const logger = Logger.getInstance();

export const authorizeRole = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        logger.warn(`Unauthorized: no user info for ${req.method} ${req.url}`);
        return res.status(401).json({ message: "Unauthorized: No user info" });
      }

      if (!req.user.role) {
        logger.warn(`Forbidden: missing role for userId=${req.user.id}`);
        return res
          .status(403)
          .json({ message: "Forbidden: User role not found" });
      }

      if (!allowedRoles.includes(req.user.role)) {
        logger.warn(
          `Forbidden: role '${req.user.role}' not allowed for ${req.user.id}`,
        );
        return res.status(403).json({
          message: `Forbidden: Role '${req.user.role}' not allowed to access this resource`,
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
