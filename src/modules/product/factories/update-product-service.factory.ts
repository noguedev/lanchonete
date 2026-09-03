import { CategoryRepository } from "../../category/category.repository.js";
import { ProductRepository } from "../product.repository.js";
import { makeImageService } from "./image-service.factory.js";
import { UpdateProductService } from "../services/update-product.service.js";

export function makeUpdateProductService() {
  const productRepository = new ProductRepository();
  const categoryRepository = new CategoryRepository();
  const imageService = makeImageService();

  return new UpdateProductService(productRepository, categoryRepository, imageService);
}
