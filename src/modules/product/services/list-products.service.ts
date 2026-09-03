import { CategoryNotFoundException } from "../../category/exceptions/category-not-found.exception.js";
import type { CategoryRepository } from "../../category/category.repository.js";
import type { ProductRepository } from "../product.repository.js";

type ListProductsOptions = {
  page: number;
  limit: number;
  categoryId?: string;
  categorySlug?: string;
};

export class ListProductsService {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly categoryRepository: CategoryRepository,
  ) {}

  async execute(options: ListProductsOptions) {
    let categoryId = options.categoryId;

    if (options.categorySlug) {
      const category = await this.categoryRepository.findBySlug(
        options.categorySlug,
      );

      if (!category) {
        throw new CategoryNotFoundException();
      }

      categoryId = category.id;
    }

    const offset = (options.page - 1) * options.limit;

    return this.productRepository.listActivePaginated(
      options.limit,
      offset,
      categoryId,
    );
  }
}
