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
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      // Extract and cast fields manually
      const dto: CreateProductDto = {
        name: req.body.name, // must exist
        description: req.body.description || "",
        price: Number(req.body.price) || 0,
        stock: Number(req.body.stock) || 0,
        category_id: Number(req.body.category_id) || 0,
        image_url: (req.file as any).path,
        image_public_id: (req.file as any).filename,
      };

      if (!dto.name) {
        return res.status(400).json({ message: "Product name is required" });
      }

      const product = await this.service.createProduct(dto);
      res.status(201).json(product);
    } catch (error) {
      this.logger.error("Product Controller: Create with Image Failed", error);
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = +req.params.id;
      const dto = { ...req.body } as UpdateProductDto;

      if (req.file) {
        dto.image_url = (req.file as any).path; 
        dto.image_public_id = (req.file as any).filename;
      }

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

  uploadImage = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      res.json({
        imageUrl: req.file.path,
        publicId: req.file.filename,
      });
    } catch (error) {
      this.logger.error("Product Controller : Upload Image Failed", error);
      next(error);
    }
  };
}
