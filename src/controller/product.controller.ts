import { Request, Response, NextFunction } from "express";
import { ProductService } from "service/product.service.js";
import { CreateProductDto, UpdateProductDto } from "dto/product.dto.js";
import { Logger } from "utils/logger.js";
import { paginationSchema } from "valildators/pagination.validator.js";

export class ProductController {
  private service = new ProductService();
  private logger = Logger.getInstance();

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dto = req.body as CreateProductDto;
      const product = await this.service.createProduct(dto);

      res.status(201).json(product);
    } catch (error) {
      this.logger.error("Product Controller: Create Failed", error);
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = +req.params.id;
      const dto = req.body as UpdateProductDto;

      const product = await this.service.updateProduct(id, dto);
      res.json(product);
    } catch (error) {
      this.logger.error("Product Controller : Updated Failed", error);
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = +req.params.id;
      await this.service.deleteProduct(id);

      res.json({ message: "Deleted Successfully" });
    } catch (error) {
      this.logger.error("Product Controller: Delete Failed", error);
      next(error);
    }
  };

  findAll = async (_: Request, res: Response, next: NextFunction) => {
    try {
      const products = await this.service.getAllProducts();

      res.json(products);
    } catch (error) {
      this.logger.error("Product Controller: FindAll Failed", error);
      next(error);
    }
  };

  findById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = +req.params.id;
      const product = await this.service.getProductById(id);

      res.json(product);
    } catch (error) {
      this.logger.error("Product Controller: FindById Failed", error);
      next(error);
    }
  };

  getPaginated = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Parse page & pageSize using Zod
      const { page, pageSize } = paginationSchema.parse({
        query: req.query,
      }).query;

      // Extract optional filtering & sorting parameters from query
      const { categoryId, minPrice, maxPrice, sortBy, sortOrder } = req.query;

      const result = await this.service.getProductsPaginated(
        Number(page),
        Number(pageSize),
        {
          categoryId: categoryId ? Number(categoryId) : undefined,
          minPrice: minPrice ? Number(minPrice) : undefined,
          maxPrice: maxPrice ? Number(maxPrice) : undefined,
        },
        {
          sortBy: sortBy as string,
          sortOrder: (sortOrder as "ASC" | "DESC") || "ASC",
        },
      );

      res.json(result);
    } catch (error) {
      this.logger.error("Product Controller: GetPaginated Failed", error);
      next(error);
    }
  };
}
