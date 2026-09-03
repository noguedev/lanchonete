import { CategoryRepository } from "../../category/category.repository.js";
import { ProductRepository } from "../product.repository.js";
import { ListProductsService } from "../services/list-products.service.js";

export function makeListProductsService() {
  const productRepository = new ProductRepository();
  const categoryRepository = new CategoryRepository();

  return new ListProductsService(productRepository, categoryRepository);
}
