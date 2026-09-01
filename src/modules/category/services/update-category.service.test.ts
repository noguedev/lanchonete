import { describe, it, expect, vi, beforeEach } from "vitest";

import { UpdateCategoryService } from "./update-category.service.js";
import { CategoryNotFoundException } from "../exceptions/category-not-found.exception.js";
import { CategorySlugConflictException } from "../exceptions/category-slug-conflict.exception.js";
import type { CategoryRepository } from "../category.repository.js";
import type { Category } from "../../../models/index.js";

const fakeCategory = (overrides: Partial<Category> = {}): Category => ({
  id: "cat1",
  name: "Lanches",
  slug: "lanches",
  description: "Salgados",
  isActive: true,
  createdAt: new Date(),
  updatedAt: null,
  ...overrides,
});

describe("UpdateCategoryService", () => {
  let findById: ReturnType<typeof vi.fn>;
  let findBySlug: ReturnType<typeof vi.fn>;
  let update: ReturnType<typeof vi.fn>;
  let service: UpdateCategoryService;

  beforeEach(() => {
    findById = vi.fn();
    findBySlug = vi.fn();
    update = vi.fn();

    const repository = {
      create: vi.fn(),
      findBySlug,
      findById,
      findActive: vi.fn(),
      update,
      setActive: vi.fn(),
    } as unknown as CategoryRepository;

    service = new UpdateCategoryService(repository);
  });

  it("throws CategoryNotFoundException when the category does not exist", async () => {
    findById.mockResolvedValue(undefined);

    await expect(
      service.execute("missing-id", { name: "Bebidas" }),
    ).rejects.toBeInstanceOf(CategoryNotFoundException);
  });

  it("recalculates the slug from the new name", async () => {
    findById.mockResolvedValue(fakeCategory());
    findBySlug.mockResolvedValue(undefined);
    update.mockResolvedValue(fakeCategory({ name: "Bebidas Geladas" }));

    await service.execute("cat1", { name: "  Bebidas Geladas  " });

    expect(update).toHaveBeenCalledWith("cat1", {
      name: "  Bebidas Geladas  ",
      slug: "bebidas-geladas",
    });
  });

  it("keeps the existing description when not provided", async () => {
    findById.mockResolvedValue(fakeCategory());
    findBySlug.mockResolvedValue(undefined);
    update.mockResolvedValue(fakeCategory({ name: "Bebidas" }));

    await service.execute("cat1", { name: "Bebidas" });

    expect(update).toHaveBeenCalledWith("cat1", {
      name: "Bebidas",
      slug: "bebidas",
    });
  });

  it("updates the description when provided", async () => {
    findById.mockResolvedValue(fakeCategory());
    findBySlug.mockResolvedValue(undefined);
    update.mockResolvedValue(fakeCategory({ description: "Bebidas geladas" }));

    await service.execute("cat1", { name: "Bebidas", description: "Bebidas geladas" });

    expect(update).toHaveBeenCalledWith("cat1", {
      name: "Bebidas",
      slug: "bebidas",
      description: "Bebidas geladas",
    });
  });

  it("allows keeping the same slug for the same category", async () => {
    findById.mockResolvedValue(fakeCategory());
    findBySlug.mockResolvedValue(fakeCategory());
    update.mockResolvedValue(fakeCategory());

    await service.execute("cat1", { name: "Lanches" });

    expect(update).toHaveBeenCalledWith(
      "cat1",
      expect.objectContaining({ slug: "lanches" }),
    );
  });

  it("throws CategorySlugConflictException when another category already uses the slug", async () => {
    findById.mockResolvedValue(fakeCategory());
    findBySlug.mockResolvedValue(fakeCategory({ id: "cat2" }));

    await expect(
      service.execute("cat1", { name: "Bebidas Geladas" }),
    ).rejects.toBeInstanceOf(CategorySlugConflictException);
  });

  it("does not update when the slug conflicts", async () => {
    findById.mockResolvedValue(fakeCategory());
    findBySlug.mockResolvedValue(fakeCategory({ id: "cat2" }));

    await expect(
      service.execute("cat1", { name: "Bebidas Geladas" }),
    ).rejects.toThrow();

    expect(update).not.toHaveBeenCalled();
  });
});
