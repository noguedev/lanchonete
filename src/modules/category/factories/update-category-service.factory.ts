import { CategoryRepository } from "../category.repository.js";
import { UpdateCategoryService } from "../services/update-category.service.js";

export function makeUpdateCategoryService() {
  const categoryRepository = new CategoryRepository();

  return new UpdateCategoryService(categoryRepository);
}
