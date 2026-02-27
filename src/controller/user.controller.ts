import { Request, Response, NextFunction } from "express";
import { UserService } from "service/user.service.js";
import { z } from "zod";
import { UserValidator } from "valildators/user.validator.js";
import { CreateUserDTO, UpdateUserDTO } from "dto/user.dto.js";
import { Logger } from "utils/logger.js";
import { paginationSchema } from "valildators/pagination.validator.js";

export class UserController {
  private userService = new UserService();
  private logger = Logger.getInstance();

  // Register
  async register(
    req: Request<
      {},
      {},
      z.infer<typeof UserValidator.createUserSchema>["body"]
    >,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const user = await this.userService.register(req.body as CreateUserDTO);
      res.status(201).json({ success: true, data: user });
    } catch (error) {
      next(error); // passes to global error handler
    }
  }

  // Login
  async login(
    req: Request<{}, {}, z.infer<typeof UserValidator.loginSchema>["body"]>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { email, password } = req.body;
      const { user, token } = await this.userService.login({ email, password });

      res.cookie("accessToken", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 24 * 60 * 60 * 1000, // 1 day
      });
      res.json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }

  // Get all users (admin only)
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await this.userService.getUsers();
      res.json({ success: true, data: users });
    } catch (error) {
      next(error);
    }
  }

  // Get user by ID
  async getById(
    req: Request<{ id: number }>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const user = await this.userService.getUserById(req.params.id);
      res.json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }

  // Update user
  async update(
    req: Request<
      { id: number },
      {},
      z.infer<typeof UserValidator.updateUserSchema>["body"]
    >,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const user = await this.userService.updateUser(
        req.params.id,
        req.body as UpdateUserDTO,
      );
      res.json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }

  // Delete user
  async delete(
    req: Request<{ id: number }>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      await this.userService.deleteUser(req.params.id);
      res.json({ success: true, message: "User deleted successfully" });
    } catch (error) {
      next(error);
    }
  }

  getAllPaginated = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page, pageSize } = paginationSchema.parse({
        query: req.query,
      }).query;

      const result = await this.userService.getUsersPaginated(page, pageSize);
      res.json(result);
    } catch (error) {
      this.logger.error("User Controller: GetAllPaginated Failed", error);
      next(error);
    }
  };
}
