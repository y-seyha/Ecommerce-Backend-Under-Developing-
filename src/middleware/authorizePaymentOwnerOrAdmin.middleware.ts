import { Request, Response, NextFunction } from "express";
import { Logger } from "utils/logger.js";
import { PaymentRepository } from "repository/payment.repository.js";
import { OrderRepository } from "repository/orders.repository.js";

const logger = Logger.getInstance();
const paymentRepo = new PaymentRepository();
const orderRepo = new OrderRepository();

export const authorizePaymentOwnerOrAdmin = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Admin bypass
      if (req.user.role === "admin") {
        return next();
      }

      const paymentId = +req.params.id;
      const payment = await paymentRepo.findById(paymentId);

      if (!payment) {
        return res.status(404).json({ message: "Payment not found" });
      }

      const order = await orderRepo.findById(payment.order_id);

      if (!order || order.user_id !== req.user.id) {
        logger.warn(
          `Forbidden: user ${req.user.id} tried to access payment ${paymentId}`,
        );
        return res.status(403).json({
          message: "Forbidden: Not your payment",
        });
      }
      next();
    } catch (err) {
      logger.error("Payment ownership check failed");
      res.status(500).json({ message: "Server error" });
    }
  };
};
