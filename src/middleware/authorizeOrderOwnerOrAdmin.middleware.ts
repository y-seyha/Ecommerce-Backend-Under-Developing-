import { Request, Response, NextFunction } from "express";
import { Logger } from "../utils/logger.js";
import { OrderRepository } from "../repository/orders.repository.js";
import { IUser } from "../model/user.model.js";

const logger = Logger.getInstance();
const orderRepo = new OrderRepository();

export const authorizeOrderOwnerOrAdmin = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Type assertion: tell TypeScript req.user is IUser
      const user = req.user as IUser;

      // Admin can access everything
      if (user.role === "admin") {
        return next();
      }

      const orderId = +req.params.id;

      const order = await orderRepo.findById(orderId);

      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      // Check ownership (convert numeric DB ID to string if needed)
      if (order.user_id.toString() !== user.id) {
        logger.warn(
          `Forbidden: user ${user.id} tried to access order ${orderId}`,
        );
        return res.status(403).json({
          message: "Forbidden: You are not the owner of this order",
        });
      }

      next();
    } catch (err) {
      logger.error("Ownership check failed", err);
      res.status(500).json({ message: "Server error" });
    }
  };
};
