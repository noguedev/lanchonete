import { CategorySlugConflictException } from "../exceptions/category-slug-conflict.exception.js";
import type { CreateCategoryDTO } from "../category.dtos.js";
import type { CategoryRepository } from "../category.repository.js";
import { slugify } from "../util/slugify.js";

export class CreateCategoryService {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async execute(data: CreateCategoryDTO) {
    const slug = data.slug ?? slugify(data.name);

    const existing = await this.categoryRepository.findBySlug(slug);

    if (existing) {
      throw new CategorySlugConflictException();
    }

    return this.categoryRepository.create({
      name: data.name,
      slug,
      description: data.description ?? null,
    });
  }
}
