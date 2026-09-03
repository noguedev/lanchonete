import { CategoryNotFoundException } from "../../category/exceptions/category-not-found.exception.js";
import type { CategoryRepository } from "../../category/category.repository.js";
import { ProductSlugConflictException } from "../exceptions/product-slug-conflict.exception.js";
import type { CreateProductDTO } from "../product.dtos.js";
import type { ProductRepository } from "../product.repository.js";
import type { ImageService } from "./image.service.js";
import { slugify } from "../../category/util/slugify.js";
import { PRODUCT_IMAGES_SUBDIR } from "../../../config/storage.js";

export class CreateProductService {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly categoryRepository: CategoryRepository,
    private readonly imageService: ImageService,
  ) {}

  async execute(data: CreateProductDTO, imageBuffer: Buffer) {
    const category = await this.categoryRepository.findById(data.categoryId);

    if (!category) {
      throw new CategoryNotFoundException();
    }

    const slug = slugify(data.name);

    const existing = await this.productRepository.findBySlug(slug);

    if (existing) {
      throw new ProductSlugConflictException();
    }

    const image = await this.imageService.sanitize(imageBuffer);
    const imageUrl = await this.imageService.save(image, PRODUCT_IMAGES_SUBDIR);

    return this.productRepository.create({
      categoryId: data.categoryId,
      name: data.name,
      slug,
      description: data.description ?? null,
      price: String(data.price),
      imageUrl,
      isAvailable: data.isAvailable === undefined ? true : data.isAvailable === "true",
    });
  }
}
