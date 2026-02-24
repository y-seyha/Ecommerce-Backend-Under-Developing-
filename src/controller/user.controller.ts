import { Request, Response } from "express";
import { UserService } from "service/user.service.js";

export class UserController {
  private userService = new UserService();

  async register(req: Request, res: Response) {
    try {
      const user = await this.userService.register(req.body);
      res.json(user);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const data = await this.userService.login({ email, password });
      res.json(data);
    } catch (error: any) {
      res.status(401).json({ message: error.message });
    }
  }

  async getAll(req: Request, res: Response) {
    try {
      const users = await this.userService.getUsers();
      res.json(users);
    } catch (error: any) {
      res.status(401).json({ message: error.message });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const user = await this.userService.getUserById(+req.params.id);
      res.json(user);
    } catch (error: any) {
      res.status(401).json({ message: error.message });
    }
  }

  async update(req: Request, res: Response) {

        try {
       const user = await this.userService.updateUser(+req.params.id, req.body);
    res.json(user);
    } catch (error: any) {
      res.status(401).json({ message: error.message });
    }
  }

  async delete(req: Request, res: Response) {
    await this.userService.deleteUser(+req.params.id);
    res.json({ message: "User deleted successfully" });
  }
}
