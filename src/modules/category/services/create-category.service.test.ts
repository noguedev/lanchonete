import { describe, it, expect, vi, beforeEach } from "vitest";

import { CreateCategoryService } from "./create-category.service.js";
import { CategorySlugConflictException } from "../exceptions/category-slug-conflict.exception.js";
import type { CategoryRepository } from "../category.repository.js";
import type { Category } from "../../../models/index.js";

const fakeCategory = (overrides: Partial<Category> = {}): Category => ({
  id: "cat1",
  name: "Lanches",
  slug: "lanches",
  description: null,
  isActive: true,
  createdAt: new Date(),
  updatedAt: null,
  ...overrides,
});

describe("CreateCategoryService", () => {
  let findBySlug: ReturnType<typeof vi.fn>;
  let create: ReturnType<typeof vi.fn>;
  let service: CreateCategoryService;

  beforeEach(() => {
    findBySlug = vi.fn();
    create = vi.fn();

    const repository = {
      create,
      findBySlug,
      findById: vi.fn(),
      findActive: vi.fn(),
      update: vi.fn(),
      setActive: vi.fn(),
    } as unknown as CategoryRepository;

    service = new CreateCategoryService(repository);
  });

  it("creates a category auto-generating the slug from the name", async () => {
    findBySlug.mockResolvedValue(undefined);
    create.mockResolvedValue(fakeCategory());

    await service.execute({ name: "  Lanches Artesanais  ", description: "Salgados" });

    expect(create).toHaveBeenCalledWith({
      name: "  Lanches Artesanais  ",
      slug: "lanches-artesanais",
      description: "Salgados",
    });
  });

  it("normalizes spaces and accents into a hyphenated slug", async () => {
    findBySlug.mockResolvedValue(undefined);
    create.mockResolvedValue(fakeCategory());

    await service.execute({ name: "  Pastel Doce!  " });

    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({ slug: "pastel-doce" }),
    );
  });

  it("stores description as null when not provided", async () => {
    findBySlug.mockResolvedValue(undefined);
    create.mockResolvedValue(fakeCategory());

    await service.execute({ name: "Lanches" });

    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({ description: null }),
    );
  });

  it("throws CategorySlugConflictException when the slug already exists", async () => {
    findBySlug.mockResolvedValue(fakeCategory());

    await expect(
      service.execute({ name: "Lanches Artesanais" }),
    ).rejects.toBeInstanceOf(CategorySlugConflictException);
  });

  it("does not create a category when the slug is duplicated", async () => {
    findBySlug.mockResolvedValue(fakeCategory());

    await expect(service.execute({ name: "Lanches Artesanais" })).rejects.toThrow();
    expect(create).not.toHaveBeenCalled();
  });
});
