import { Request, Response, NextFunction } from "express";
import { UserRole } from "model/user.model.js";
import { Logger } from "utils/logger.js";

const logger = Logger.getInstance();

export const authorizeRoleOrSelf = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        logger.warn(`Unauthorized: no user info for ${req.method} ${req.url}`);
        return res.status(401).json({ message: "Unauthorized: No user info" });
      }

      // the user being updated
      const targetUserId = +req.params.id;

      // Admin can update anyone
      if (req.user.role === "admin") return next();

      // Otherwise, user can update only themselves
      if (req.user.id === targetUserId) return next();

      logger.warn(
        `Forbidden: userId=${req.user.id} cannot modify userId=${targetUserId}`,
      );
      return res.status(403).json({
        message: "Forbidden: You can only update your own profile",
      });
    } catch (err: any) {
      logger.error(
        `authorizeRoleOrSelf failed: ${req.method} ${req.url} - ${err.message}`,
      );
      return res.status(500).json({ message: "Internal Server Error" });
    }
  };
};
