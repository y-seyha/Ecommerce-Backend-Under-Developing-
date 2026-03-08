import { Request, Response, NextFunction } from "express";
import {
  UserCartItemService,
  AdminCartItemService,
} from "service/cartItem.service.js";
import { CreateCartItemDto, UpdateCartItemDto } from "../dto/cartItem.dto.js";
import { Logger } from "utils/logger.js";
// import { paginationSchema } from "valildators/pagination.validator.js";

export class UserCartItemController {
  private service = new UserCartItemService();
  private logger = Logger.getInstance();

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      if (!userId) return res.status(401).json({ message: "Unauthorized" });

      const dto = req.body as CreateCartItemDto;
      const item = await this.service.createCartItem(dto, userId);
      res.status(201).json(item);
    } catch (error) {
      this.logger.error("UserCartItemController: Create Failed", error);
      next(error);
    }
  };

  getItemsByCartId = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const userId = req.user!.id;
      if (!userId) return res.status(401).json({ message: "Unauthorized" });

      const cartId = +req.params.cartId;
      const items = await this.service.getItemsByCartId(cartId, userId);
      res.json({ cartId, items });
    } catch (error) {
      this.logger.error(
        "UserCartItemController: getItemsByCartId Failed",
        error,
      );
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ message: "Unauthorized" });

      const id = +req.params.id;
      const dto = req.body as UpdateCartItemDto;
      const item = await this.service.updateCartItem(id, dto, userId);
      res.json({ message: "Cart updated successfully", data: item });
    } catch (error) {
      this.logger.error("UserCartItemController: Update Failed", error);
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ message: "Unauthorized" });

      const id = +req.params.id;
      await this.service.deleteCartItem(id, userId);
      res.json({ message: "Deleted successfully" });
    } catch (error) {
      this.logger.error("UserCartItemController: Delete Failed", error);
      next(error);
    }
  };
}

export class AdminCartItemController {
  private service = new AdminCartItemService();
  private logger = Logger.getInstance();

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dto = req.body as CreateCartItemDto;
      const item = await this.service.createCartItem(dto);
      res.status(201).json(item);
    } catch (error) {
      this.logger.error("AdminCartItemController: Create Failed", error);
      next(error);
    }
  };

  getAll = async (_: Request, res: Response, next: NextFunction) => {
    try {
      const items = await this.service.getAllCartItems();
      res.json(items);
    } catch (error) {
      this.logger.error("AdminCartItemController: GetAll Failed", error);
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = +req.params.id;
      const item = await this.service.getCartItemById(id);
      res.json(item);
    } catch (error) {
      this.logger.error("AdminCartItemController: GetById Failed", error);
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = +req.params.id;
      const dto = req.body as UpdateCartItemDto;
      const item = await this.service.updateCartItem(id, dto);
      res.json({ message: "Cart updated successfully", data: item });
    } catch (error) {
      this.logger.error("AdminCartItemController: Update Failed", error);
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = +req.params.id;
      await this.service.deleteCartItem(id);
      res.json({ message: "Deleted successfully" });
    } catch (error) {
      this.logger.error("AdminCartItemController: Delete Failed", error);
      next(error);
    }
  };
}
