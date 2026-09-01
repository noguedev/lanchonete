import { CategoryRepository } from "../category.repository.js";
import { DeactivateCategoryService } from "../services/deactivate-category.service.js";

export function makeDeactivateCategoryService() {
  const categoryRepository = new CategoryRepository();

  return new DeactivateCategoryService(categoryRepository);
}
