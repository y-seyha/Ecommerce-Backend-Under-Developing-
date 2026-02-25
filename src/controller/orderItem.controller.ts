import { Request, Response, NextFunction } from "express";
import { OrderItemService } from "../service/orderItem.service.js";
import {
  CreateOrderItemDTO,
  UpdateOrderItemDTO,
} from "../model/orderItem.model.js";
import { Logger } from "utils/logger.js";
import { paginationSchema } from "valildators/pagination.validator.js";

export class OrderItemController {
  private service = new OrderItemService();
  private logger = Logger.getInstance();

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dto = req.body as CreateOrderItemDTO;
      const item = await this.service.createOrderItem(dto);
      res.status(201).json(item);
    } catch (error) {
      this.logger.error("OrderItem Controller: Create Failed", error);
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = +req.params.id;
      const dto = req.body as UpdateOrderItemDTO;
      const item = await this.service.updateOrderItem(id, dto);
      res.json(item);
    } catch (error) {
      this.logger.error("OrderItem Controller: Update Failed", error);
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = +req.params.id;
      const success = await this.service.deleteOrderItem(id);
      if (success) res.json({ message: "Deleted Successfully" });
      else res.status(404).json({ message: "OrderItem not found" });
    } catch (error) {
      this.logger.error("OrderItem Controller: Delete Failed", error);
      next(error);
    }
  };

  findAll = async (_: Request, res: Response, next: NextFunction) => {
    try {
      const items = await this.service.getAllOrderItems();
      res.json(items);
    } catch (error) {
      this.logger.error("OrderItem Controller: FindAll Failed", error);
      next(error);
    }
  };

  findById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = +req.params.id;
      const item = await this.service.getOrderItemById(id);
      if (item) res.json(item);
      else res.status(404).json({ message: "OrderItem not found" });
    } catch (error) {
      this.logger.error("OrderItem Controller: FindById Failed", error);
      next(error);
    }
  };

  findByOrderId = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const order_id = +req.params.order_id;
      const items = await this.service.getItemsByOrderId(order_id);
      res.json(items);
    } catch (error) {
      this.logger.error("OrderItem Controller: FindByOrderId Failed", error);
      next(error);
    }
  };

  getPaginated = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page, pageSize } = paginationSchema.parse({
        query: req.query,
      }).query;

      const result = await this.service.getOrderItemPaginated(page, pageSize);
      res.json(result);
    } catch (error) {
      this.logger.error("Order Item Controller: GetPaginated Failed", error);
      next(error);
    }
  };
}
