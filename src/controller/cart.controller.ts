import { Request, Response, NextFunction } from "express";
import { CartService } from "service/cart.service.js";
import { CreateCartDto, UpdateCartDto } from "model/cart.model.js";
import { Logger } from "utils/logger.js";
import { CartValidator } from "valildators/cart.validator.js";
import { paginationSchema } from "valildators/pagination.validator.js";

export class CartController {
  private service = new CartService();
  private logger = Logger.getInstance();

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dto = req.body as CreateCartDto;
      const cart = await this.service.createCart(dto);

      res.status(201).json(cart);
    } catch (error) {
      this.logger.error("Cart Controller: Create Failed", error);
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = +req.params.id;
      const dto = req.body as UpdateCartDto;
      const cart = await this.service.updateCart(id, dto);
    } catch (error) {
      this.logger.error("Cart Controller: Update Failed", error);
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = +req.params.id;
      await this.service.deleteCart(id);
      res.json({ message: "Deleted Successfully" });
    } catch (error) {
      this.logger.error("Cart Controller: Delete Failed", error);
      next(error);
    }
  };

  findAll = async (_: Request, res: Response, next: NextFunction) => {
    try {
      const carts = await this.service.getAllCarts();
      res.json(carts);
    } catch (error) {
      this.logger.error("Cart Controller: FindAll Failed", error);
      next(error);
    }
  };

  findById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = +req.params.id;
      const cart = await this.service.getCartById(id);
      res.json(cart);
    } catch (error) {
      this.logger.error("Cart Controller: FindById Failed", error);
      next(error);
    }
  };

  getPaginated = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Parse query safely
      const { page, pageSize } = paginationSchema.parse({
        query: req.query,
      }).query;

      const result = await this.service.getCartPaginated(page, pageSize);
      res.json(result);
    } catch (error) {
      this.logger.error("Cart Controller: GetPaginated Failed", error);
      next(error);
    }
  };
}
