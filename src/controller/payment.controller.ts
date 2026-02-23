import { Request, Response, NextFunction } from "express";
import { PaymentService } from "../service/payment.service.js";
import { CreatePaymentDTO, UpdatePaymentDTO } from "../dto/payment.dto.js";
import { Logger } from "utils/logger.js";

export class PaymentController {
  private service = new PaymentService();
  private logger = Logger.getInstance();

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dto = req.body as CreatePaymentDTO;
      const payment = await this.service.createPayment(dto);
      res.status(201).json(payment);
    } catch (error) {
      this.logger.error("Payment Controller: Create Failed", error);
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = +req.params.id;
      const dto = req.body as UpdatePaymentDTO;
      const payment = await this.service.updatePayment(id, dto);
      res.json(payment);
    } catch (error) {
      this.logger.error("Payment Controller: Update Failed", error);
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = +req.params.id;
      const success = await this.service.deletePayment(id);
      if (success) res.json({ message: "Deleted Successfully" });
      else res.status(404).json({ message: "Payment not found" });
    } catch (error) {
      this.logger.error("Payment Controller: Delete Failed", error);
      next(error);
    }
  };

  findAll = async (_: Request, res: Response, next: NextFunction) => {
    try {
      const payments = await this.service.getAllPayments();
      res.json(payments);
    } catch (error) {
      this.logger.error("Payment Controller: FindAll Failed", error);
      next(error);
    }
  };

  findById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = +req.params.id;
      const payment = await this.service.getPaymentById(id);
      if (payment) res.json(payment);
      else res.status(404).json({ message: "Payment not found" });
    } catch (error) {
      this.logger.error("Payment Controller: FindById Failed", error);
      next(error);
    }
  };

  findByOrderId = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const order_id = +req.params.order_id;
      const payments = await this.service.getPaymentsByOrderId(order_id);
      res.json(payments);
    } catch (error) {
      this.logger.error("Payment Controller: FindByOrderId Failed", error);
      next(error);
    }
  };
}
