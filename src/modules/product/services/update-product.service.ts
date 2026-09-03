import { CategoryNotFoundException } from "../../category/exceptions/category-not-found.exception.js";
import type { CategoryRepository } from "../../category/category.repository.js";
import { ProductNotFoundException } from "../exceptions/product-not-found.exception.js";
import { ProductSlugConflictException } from "../exceptions/product-slug-conflict.exception.js";
import type { UpdateProductDTO } from "../product.dtos.js";
import type { ProductRepository } from "../product.repository.js";
import type { ImageService } from "./image.service.js";
import { slugify } from "../../category/util/slugify.js";
import { PRODUCT_IMAGES_SUBDIR } from "../../../config/storage.js";
import type { ProductInsert } from "../../../models/index.js";

export class UpdateProductService {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly categoryRepository: CategoryRepository,
    private readonly imageService: ImageService,
  ) {}

  async execute(id: string, data: UpdateProductDTO, imageBuffer?: Buffer) {
    const product = await this.productRepository.findById(id);

    if (!product) {
      throw new ProductNotFoundException();
    }

    if (data.categoryId) {
      const category = await this.categoryRepository.findById(data.categoryId);

      if (!category) {
        throw new CategoryNotFoundException();
      }
    }

    const payload: Partial<ProductInsert> = {};

    if (data.name !== undefined) {
      payload.name = data.name;
      payload.slug = slugify(data.name);

      const existing = await this.productRepository.findBySlug(payload.slug);

      if (existing && existing.id !== id) {
        throw new ProductSlugConflictException();
      }
    }

    if (data.price !== undefined) {
      payload.price = String(data.price);
    }

    if (data.description !== undefined) {
      payload.description = data.description;
    }

    if (data.isAvailable !== undefined) {
      payload.isAvailable = data.isAvailable === "true";
    }

    if (imageBuffer) {
      const image = await this.imageService.sanitize(imageBuffer);
      payload.imageUrl = await this.imageService.save(image, PRODUCT_IMAGES_SUBDIR);
    }

    return this.productRepository.update(id, payload);
  }
}
