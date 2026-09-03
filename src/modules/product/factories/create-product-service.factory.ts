import { CategoryRepository } from "../../category/category.repository.js";
import { ProductRepository } from "../product.repository.js";
import { makeImageService } from "./image-service.factory.js";
import { CreateProductService } from "../services/create-product.service.js";

export function makeCreateProductService() {
  const productRepository = new ProductRepository();
  const categoryRepository = new CategoryRepository();
  const imageService = makeImageService();

  return new CreateProductService(productRepository, categoryRepository, imageService);
}
