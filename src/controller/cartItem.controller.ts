import { Request, Response, NextFunction } from "express";
import { CartItemService } from "service/cartItem.service.js";
import { CreateCartItemDto, UpdateCartItemDto } from "../dto/cartItem.dto.js";
import { Logger } from "utils/logger.js";
import { paginationSchema } from "valildators/pagination.validator.js";

export class CartItemController {
  private service = new CartItemService();
  private logger = Logger.getInstance();

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dto = req.body as CreateCartItemDto;
      const item = await this.service.createCartItem(dto);
      res.status(201).json(item);
    } catch (error) {
      this.logger.error("CartItem Controller: Create Failed", error);
      next(error);
    }
  };

  findAll = async (_: Request, res: Response, next: NextFunction) => {
    try {
      const items = await this.service.getAllCartItems();
      res.json(items);
    } catch (error) {
      this.logger.error("CartItem Controller: FindAll Failed", error);
      next(error);
    }
  };

  findById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = +req.params.id;
      const item = await this.service.getCartItemById(id);
      res.json(item);
    } catch (error) {
      this.logger.error("CartItem Controller: FindById Failed", error);
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = +req.params.id;
      const dto = req.body as UpdateCartItemDto;
      const item = await this.service.updateCartItem(id, dto);
      res.json({
        message: "Cart updated successfully",
        data: item,
      });
    } catch (error) {
      this.logger.error("CartItem Controller: Update Failed", error);
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = +req.params.id;
      await this.service.deleteCartItem(id);
      res.json({ message: "Deleted successfully" });
    } catch (error) {
      this.logger.error("CartItem Controller: Delete Failed", error);
      next(error);
    }
  };

  getPaginated = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page, pageSize } = paginationSchema.parse({
        query: req.query,
      }).query;

      const result = await this.service.getCartItemPaginated(page, pageSize);
      res.json(result);
    } catch (error) {
      this.logger.error("Cart Item Controller: GetPaginated Failed", error);
      next(error);
    }
  };

  getItemsByCartId = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const cartId = +req.params.cartId;
      const items = await this.service.getItemsByCartId(cartId);

      res.json({
        cartId,
        items,
      });
    } catch (error) {
      this.logger.error("CartItem Controller: getItemsByCartId Failed", error);
      next(error);
    }
  };
}
