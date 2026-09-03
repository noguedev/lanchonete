import { describe, it, expect, vi, beforeEach } from "vitest";

import { CreateProductService } from "./create-product.service.js";
import { CategoryNotFoundException } from "../../category/exceptions/category-not-found.exception.js";
import { ProductSlugConflictException } from "../exceptions/product-slug-conflict.exception.js";
import type { ProductRepository } from "../product.repository.js";
import type { CategoryRepository } from "../../category/category.repository.js";
import type { ImageService } from "./image.service.js";
import type { Category, Product } from "../../../models/index.js";

const fakeCategory = (): Category => ({
  id: "cat1",
  name: "Lanches",
  slug: "lanches",
  description: null,
  isActive: true,
  createdAt: new Date(),
  updatedAt: null,
});

const fakeProduct = (overrides: Partial<Product> = {}): Product => ({
  id: "prod1",
  categoryId: "cat1",
  name: "Hambúrguer",
  slug: "hamburguer",
  description: null,
  price: "19.90",
  imageUrl: "/uploads/products/x.png",
  isAvailable: true,
  isActive: true,
  createdAt: new Date(),
  updatedAt: null,
  ...overrides,
});

const imageBuffer = Buffer.from("fake-image-buffer");

describe("CreateProductService", () => {
  let productRepo: ProductRepository;
  let categoryRepo: CategoryRepository;
  let imageService: ImageService;
  let create: ReturnType<typeof vi.fn>;
  let findBySlug: ReturnType<typeof vi.fn>;
  let findCategoryById: ReturnType<typeof vi.fn>;
  let sanitize: ReturnType<typeof vi.fn>;
  let save: ReturnType<typeof vi.fn>;
  let service: CreateProductService;

  beforeEach(() => {
    create = vi.fn();
    findBySlug = vi.fn();
    findCategoryById = vi.fn();
    sanitize = vi.fn().mockResolvedValue({ buffer: imageBuffer, format: "png", ext: "png" });
    save = vi.fn().mockResolvedValue("/uploads/products/abc.png");

    productRepo = {
      create,
      findBySlug,
      findById: vi.fn(),
      listActive: vi.fn(),
      listActiveByCategory: vi.fn(),
      update: vi.fn(),
      setActive: vi.fn(),
    } as unknown as ProductRepository;

    categoryRepo = {
      findById: findCategoryById,
      findBySlug: vi.fn(),
      create: vi.fn(),
      findActive: vi.fn(),
      update: vi.fn(),
      setActive: vi.fn(),
    } as unknown as CategoryRepository;

    imageService = { sanitize, save } as unknown as ImageService;

    service = new CreateProductService(productRepo, categoryRepo, imageService);
  });

  it("creates a product saving the sanitized image and returning its url", async () => {
    findCategoryById.mockResolvedValue(fakeCategory());
    findBySlug.mockResolvedValue(undefined);
    const createdProduct = fakeProduct();
    create.mockResolvedValue(createdProduct);

    const result = await service.execute(
      { name: "Hambúrguer Artesanal", categoryId: "cat1", price: 19.9 },
      imageBuffer,
    );

    expect(sanitize).toHaveBeenCalledWith(imageBuffer);
    expect(save).toHaveBeenCalledWith(
      expect.objectContaining({ format: "png" }),
      "products",
    );
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        categoryId: "cat1",
        slug: "hamburguer-artesanal",
        price: "19.9",
        imageUrl: "/uploads/products/abc.png",
        isAvailable: true,
      }),
    );
    expect(result).toEqual(createdProduct);
  });

  it("normalizes spaces and accents into a hyphenated slug", async () => {
    findCategoryById.mockResolvedValue(fakeCategory());
    findBySlug.mockResolvedValue(undefined);
    create.mockResolvedValue(fakeProduct());

    await service.execute(
      { name: "  Pastel Doce!  ", categoryId: "cat1", price: 9.9 },
      imageBuffer,
    );

    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({ slug: "pastel-doce" }),
    );
  });

  it("throws CategoryNotFoundException when the category does not exist", async () => {
    findCategoryById.mockResolvedValue(undefined);

    await expect(
      service.execute({ name: "Hambúrguer", categoryId: "cat-", price: 19.9 }, imageBuffer),
    ).rejects.toBeInstanceOf(CategoryNotFoundException);
  });

  it("throws ProductSlugConflictException when the slug already exists", async () => {
    findCategoryById.mockResolvedValue(fakeCategory());
    findBySlug.mockResolvedValue(fakeProduct());

    await expect(
      service.execute({ name: "Hambúrguer", categoryId: "cat1", price: 19.9 }, imageBuffer),
    ).rejects.toBeInstanceOf(ProductSlugConflictException);
  });

  it("does not save the image or create the product on slug conflict", async () => {
    findCategoryById.mockResolvedValue(fakeCategory());
    findBySlug.mockResolvedValue(fakeProduct());

    await expect(
      service.execute({ name: "Hambúrguer", categoryId: "cat1", price: 19.9 }, imageBuffer),
    ).rejects.toThrow();

    expect(save).not.toHaveBeenCalled();
    expect(create).not.toHaveBeenCalled();
  });

  it("maps isAvailable to false when the field is sent as false", async () => {
    findCategoryById.mockResolvedValue(fakeCategory());
    findBySlug.mockResolvedValue(undefined);
    create.mockResolvedValue(fakeProduct());

    await service.execute(
      { name: "Hambúrguer", categoryId: "cat1", price: 19.9, isAvailable: "false" as never },
      imageBuffer,
    );

    expect(create).toHaveBeenCalledWith(expect.objectContaining({ isAvailable: false }));
  });
});
