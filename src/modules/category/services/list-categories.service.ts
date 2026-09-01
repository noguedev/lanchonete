import type { CategoryRepository } from "../category.repository.js";

export class ListCategoriesService {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async execute() {
    return this.categoryRepository.findActive();
  }
}
