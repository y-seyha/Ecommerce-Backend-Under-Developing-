import { Request, Response, NextFunction } from "express";
import { Logger } from "utils/logger.js";
import { OrderRepository } from "repository/orders.repository.js";

const logger = Logger.getInstance();
const orderRepo = new OrderRepository();

export const authorizeOrderOwnerOrAdmin = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Admin can access everything
      if (req.user.role === "admin") {
        return next();
      }

      const orderId = +req.params.id;

      const order = await orderRepo.findById(orderId);

      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      // Check ownership
      if (order.user_id !== req.user.id) {
        logger.warn(
          `Forbidden: user ${req.user.id} tried to access order ${orderId}`,
        );
        return res.status(403).json({
          message: "Forbidden: You are not the owner of this order",
        });
      }

      next();
    } catch (err) {
      logger.error("Ownership check failed");
      res.status(500).json({ message: "Server error" });
    }
  };
};
