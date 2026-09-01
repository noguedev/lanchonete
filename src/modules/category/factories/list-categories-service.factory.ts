import { CategoryRepository } from "../category.repository.js";
import { ListCategoriesService } from "../services/list-categories.service.js";

export function makeListCategoriesService() {
  const categoryRepository = new CategoryRepository();

  return new ListCategoriesService(categoryRepository);
}
