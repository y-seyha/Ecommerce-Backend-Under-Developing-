import { ProductRepository } from "repository/product.repository.js";
import { CreateProductDto, UpdateProductDto } from "../dto/product.dto.js";
import { Logger } from "utils/logger.js";
import { Database } from "Configuration/database.js";

export class ProductService {
  private repo = new ProductRepository();
  private logger = Logger.getInstance();
  private pool = Database.getInstance();

  async createProduct(dto: CreateProductDto) {
    try {
      if (dto.category_id) {
        const { rows } = await this.pool.query(
          `SELECT id FROM categories WHERE id=$1`,
          [dto.category_id],
        );

        if (!rows.length) {
          this.logger.warn(
            `Create Product Failed: Category ${dto.category_id} not found`,
          );

          throw new Error("Category does not exist");
        }
      }

      dto.stock = dto.stock ?? 0;

      return await this.repo.create(dto);
    } catch (error) {
      this.logger.error("Product Service: Create Failed", error);
      throw error;
    }
  }

  async updateProduct(id: number, dto: UpdateProductDto) {
    try {
      const existing = await this.repo.findById(id);

      if (!existing) {
        this.logger.warn(`Update Failed: Product ${id} not found`);
        throw new Error("Product not found");
      }

      if (dto.category_id) {
        const { rows } = await this.pool.query(
          `SELECT id FROM categories WHERE id=$1`,
          [dto.category_id],
        );

        if (!rows.length) {
          this.logger.warn(
            `Update Failed: Category ${dto.category_id} not found`,
          );

          throw new Error("Category does not exist");
        }
      }

      const updatedProduct = {
        ...existing,
        ...dto,
      };

      return await this.repo.update(id, updatedProduct);
    } catch (error) {
      this.logger.error("Product Service: Update Failed", error);
      throw error;
    }
  }

  async deleteProduct(id: number) {
    const existing = await this.repo.findById(id);
    if (!existing) throw new Error("Product not found");

    await this.repo.delete(id);
  }

  async getAllProducts() {
    return await this.repo.findAll();
  }

  async getProductById(id: number) {
    const product = await this.repo.findById(id);

    if (!product) throw new Error("Product not found");

    return product;
  }

  async getProductsPaginated(page: number, pageSize: number) {
  try {
    return await this.repo.findAllPaginated(page, pageSize);
  } catch (error) {
    this.logger.error("Product Service: GetPaginated Failed", error);
    throw error;
  }
}
}
