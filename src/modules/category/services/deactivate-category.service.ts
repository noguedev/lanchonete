import { CategoryNotFoundException } from "../exceptions/category-not-found.exception.js";
import type { CategoryRepository } from "../category.repository.js";

export class DeactivateCategoryService {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async execute(id: string) {
    const category = await this.categoryRepository.findById(id);

    if (!category) {
      throw new CategoryNotFoundException();
    }

    return this.categoryRepository.setActive(id, false);
  }
}
