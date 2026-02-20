import { CategoryRepository } from "repository/category.repository.js";
import { CreateCategoryDto, UpdateCategoryDto } from "dto/category.dto.js";
import { Logger } from "utils/logger.js";

export class CategoryService {
  private repo = new CategoryRepository();
  private logger = Logger.getInstance();

  async createCategory(dto: CreateCategoryDto) {
    try {
      const category = await this.repo.create(dto);
      return category;
    } catch (error) {
      this.logger.error("Category Service: Create Failed", error);
      throw error;
    }
  }

  async updateCategory(id: number, dto: UpdateCategoryDto) {
    try {
      const existing = await this.repo.findById(id);
      if (!existing) {
        this.logger.warn(`Update Failed: Category ${id} not found`);
      }

      const updateCategory = { ...existing, ...dto };
      return await this.repo.update(id, updateCategory);
    } catch (error) {
      this.logger.error("Category Service: Update Failed", error);
      throw error;
    }
  }

  async deleteCategory(id: number) {
    const existing = await this.repo.findById(id);
    if (!existing) {
      this.logger.warn(`Deleted failed: Category ${id} not found`);
    }
    await this.repo.delete(id);
  }

  async getallCategories() {
    return await this.repo.getAll();
  }

  async getCategoryById(id: number) {
    const category = await this.repo.findById(id);
    if (!category) {
      this.logger.warn(`Category ${id} not found`);
    }

    return category;
  }
}
