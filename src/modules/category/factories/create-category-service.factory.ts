import { CategoryRepository } from "../category.repository.js";
import { CreateCategoryService } from "../services/create-category.service.js";

export function makeCreateCategoryService() {
  const categoryRepository = new CategoryRepository();

  return new CreateCategoryService(categoryRepository);
}
