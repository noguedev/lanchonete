import { describe, it, expect, vi, beforeEach } from "vitest";

import { ListProductsService } from "./list-products.service.js";
import { CategoryNotFoundException } from "../../category/exceptions/category-not-found.exception.js";
import type { ProductRepository } from "../product.repository.js";
import type { CategoryRepository } from "../../category/category.repository.js";
import type { Category, Product } from "../../../models/index.js";

const fakeCategory = (): Category => ({
  id: "cat1",
  name: "Bebidas",
  slug: "bebidas",
  description: null,
  isActive: true,
  createdAt: new Date(),
  updatedAt: null,
});

const fakeProduct = (): Product => ({
  id: "prod1",
  categoryId: "cat1",
  name: "Coca",
  slug: "coca",
  description: null,
  price: "10.00",
  imageUrl: "/uploads/products/x.png",
  isAvailable: true,
  isActive: true,
  createdAt: new Date(),
  updatedAt: null,
});

describe("ListProductsService", () => {
  let listActivePaginated: ReturnType<typeof vi.fn>;
  let findCategoryBySlug: ReturnType<typeof vi.fn>;
  let service: ListProductsService;

  beforeEach(() => {
    listActivePaginated = vi.fn().mockResolvedValue({ items: [fakeProduct()], total: 1 });
    findCategoryBySlug = vi.fn();

    const productRepo = {
      listActivePaginated,
      create: vi.fn(),
      findById: vi.fn(),
      findBySlug: vi.fn(),
      update: vi.fn(),
      setActive: vi.fn(),
    } as unknown as ProductRepository;

    const categoryRepo = {
      findBySlug: findCategoryBySlug,
      findById: vi.fn(),
      create: vi.fn(),
      findActive: vi.fn(),
      update: vi.fn(),
      setActive: vi.fn(),
    } as unknown as CategoryRepository;

    service = new ListProductsService(productRepo, categoryRepo);
  });

  it("lists paginated products without filters", async () => {
    const expected = { items: [fakeProduct()], total: 1 };
    listActivePaginated.mockResolvedValue(expected);

    const result = await service.execute({ page: 2, limit: 12 });

    expect(listActivePaginated).toHaveBeenCalledWith(12, 12, undefined);
    expect(result).toEqual(expected);
  });

  it("lists paginated products by a category slug", async () => {
    findCategoryBySlug.mockResolvedValue(fakeCategory());

    await service.execute({ page: 1, limit: 20, categorySlug: "bebidas" });

    expect(findCategoryBySlug).toHaveBeenCalledWith("bebidas");
    expect(listActivePaginated).toHaveBeenCalledWith(20, 0, "cat1");
  });

  it("throws CategoryNotFoundException when the category slug does not exist", async () => {
    findCategoryBySlug.mockResolvedValue(undefined);

    await expect(
      service.execute({ page: 1, limit: 20, categorySlug: "nao-existe" }),
    ).rejects.toBeInstanceOf(CategoryNotFoundException);
  });

  it("computes the offset from page and limit", async () => {
    await service.execute({ page: 3, limit: 10 });

    expect(listActivePaginated).toHaveBeenCalledWith(10, 20, undefined);
  });
});
