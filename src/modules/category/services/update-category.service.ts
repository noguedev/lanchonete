import { CategoryNotFoundException } from "../exceptions/category-not-found.exception.js";
import { CategorySlugConflictException } from "../exceptions/category-slug-conflict.exception.js";
import type { UpdateCategoryDTO } from "../category.dtos.js";
import type { CategoryRepository } from "../category.repository.js";
import type { CategoryInsert } from "../../../models/index.js";
import { slugify } from "../util/slugify.js";

export class UpdateCategoryService {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async execute(id: string, data: UpdateCategoryDTO) {
    const category = await this.categoryRepository.findById(id);

    if (!category) {
      throw new CategoryNotFoundException();
    }

    const slug = slugify(data.name);

    const existing = await this.categoryRepository.findBySlug(slug);

    if (existing && existing.id !== id) {
      throw new CategorySlugConflictException();
    }

    const payload: Partial<CategoryInsert> = { name: data.name, slug };

    if (data.description !== undefined) {
      payload.description = data.description;
    }

    return this.categoryRepository.update(id, payload);
  }
}
