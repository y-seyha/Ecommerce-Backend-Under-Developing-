import { Request, Response, NextFunction } from "express";
import { CategoryService } from "service/category.service.js";
import { CreateCategoryDto, UpdateCategoryDto } from "dto/category.dto.js";
import { Logger } from "utils/logger.js";

export class CategoryController {
  private service = new CategoryService();
  private logger = Logger.getInstance();

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dto = req.body as CreateCategoryDto;
      const category = await this.service.createCategory(dto);

      res.status(201).json(category);
    } catch (error) {
      this.logger.error("Category Controller: Created Failed", error);
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = +req.params.id;
      const dto = req.body as UpdateCategoryDto;
      const category = await this.service.updateCategory(id, dto);

      res.json(category);
    } catch (error) {
      this.logger.error("Category Controller: Update Failed", error);
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = +req.params.id;
      await this.service.deleteCategory(id);
      res.json({ message: "Deleted Successfully" });
    } catch (error) {
      this.logger.error("Category Controller: Delete Failed", error);
      next(error);
    }
  };

  findAll = async (_: Request, res: Response, next: NextFunction) => {
    try {
      const categories = await this.service.getallCategories();
      res.json(categories);
    } catch (error) {
      this.logger.error("Category Controller: FindAll Failed", error);
      next(error);
    }
  };

  findById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = +req.params.id;
      const category = await this.service.getCategoryById(id);
      res.json(category);
    } catch (error) {
      this.logger.error("Category Controller: FindById Failed", error);
      next(error);
    }
  };
}
