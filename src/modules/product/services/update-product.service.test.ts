import { describe, it, expect, vi, beforeEach } from "vitest";

import { UpdateProductService } from "./update-product.service.js";
import { ProductNotFoundException } from "../exceptions/product-not-found.exception.js";
import { ProductSlugConflictException } from "../exceptions/product-slug-conflict.exception.js";
import { CategoryNotFoundException } from "../../category/exceptions/category-not-found.exception.js";
import type { ProductRepository } from "../product.repository.js";
import type { CategoryRepository } from "../../category/category.repository.js";
import type { ImageService } from "./image.service.js";
import type { Product } from "../../../models/index.js";

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

describe("UpdateProductService", () => {
  let productRepo: ProductRepository;
  let categoryRepo: CategoryRepository;
  let imageService: ImageService;
  let findById: ReturnType<typeof vi.fn>;
  let findBySlug: ReturnType<typeof vi.fn>;
  let update: ReturnType<typeof vi.fn>;
  let findCategoryById: ReturnType<typeof vi.fn>;
  let sanitize: ReturnType<typeof vi.fn>;
  let save: ReturnType<typeof vi.fn>;
  let service: UpdateProductService;

  beforeEach(() => {
    findById = vi.fn();
    findBySlug = vi.fn();
    update = vi.fn();
    findCategoryById = vi.fn();
    sanitize = vi.fn().mockResolvedValue({ buffer: imageBuffer, format: "png", ext: "png" });
    save = vi.fn().mockResolvedValue("/uploads/products/new.png");

    productRepo = {
      create: vi.fn(),
      findBySlug,
      findById,
      listActive: vi.fn(),
      listActiveByCategory: vi.fn(),
      update,
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

    service = new UpdateProductService(productRepo, categoryRepo, imageService);
  });

  it("throws ProductNotFoundException when the product does not exist", async () => {
    findById.mockResolvedValue(undefined);

    await expect(
      service.execute("prod1", { price: 25 }),
    ).rejects.toBeInstanceOf(ProductNotFoundException);
  });

  it("recalculates the slug when renaming", async () => {
    findById.mockResolvedValue(fakeProduct());
    findBySlug.mockResolvedValue(undefined);
    update.mockResolvedValue(fakeProduct({ name: "X-Burger", slug: "x-burger" }));

    await service.execute("prod1", { name: "X-Burger" });

    expect(update).toHaveBeenCalledWith("prod1", {
      name: "X-Burger",
      slug: "x-burger",
    });
  });

  it("throws ProductSlugConflictException when another product uses the slug", async () => {
    findById.mockResolvedValue(fakeProduct());
    findBySlug.mockResolvedValue(fakeProduct({ id: "prod2" }));

    await expect(
      service.execute("prod1", { name: "X-Burger" }),
    ).rejects.toBeInstanceOf(ProductSlugConflictException);
  });

  it("updates price and availability", async () => {
    findById.mockResolvedValue(fakeProduct());
    findBySlug.mockResolvedValue(undefined);
    update.mockResolvedValue(fakeProduct({ price: "25.00", isAvailable: false }));

    await service.execute("prod1", { price: 25, isAvailable: "false" as never });

    expect(update).toHaveBeenCalledWith("prod1", { price: "25", isAvailable: false });
  });

  it("saves a new image and updates imageUrl when a file is provided", async () => {
    findById.mockResolvedValue(fakeProduct());
    findBySlug.mockResolvedValue(undefined);
    update.mockResolvedValue(fakeProduct({ imageUrl: "/uploads/products/new.png" }));

    await service.execute("prod1", {}, imageBuffer);

    expect(sanitize).toHaveBeenCalledWith(imageBuffer);
    expect(update).toHaveBeenCalledWith(
      "prod1",
      expect.objectContaining({ imageUrl: "/uploads/products/new.png" }),
    );
  });

  it("throws CategoryNotFoundException when changing to a non-existent category", async () => {
    findById.mockResolvedValue(fakeProduct());
    findCategoryById.mockResolvedValue(undefined);

    await expect(
      service.execute("prod1", { categoryId: "cat-x" }),
    ).rejects.toBeInstanceOf(CategoryNotFoundException);
  });
});
