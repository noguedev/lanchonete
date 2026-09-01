import { describe, it, expect, vi, beforeEach } from "vitest";

import { DeactivateCategoryService } from "./deactivate-category.service.js";
import { CategoryNotFoundException } from "../exceptions/category-not-found.exception.js";
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

describe("DeactivateCategoryService", () => {
  let findById: ReturnType<typeof vi.fn>;
  let setActive: ReturnType<typeof vi.fn>;
  let service: DeactivateCategoryService;

  beforeEach(() => {
    findById = vi.fn();
    setActive = vi.fn();

    const repository = {
      create: vi.fn(),
      findBySlug: vi.fn(),
      findById,
      findActive: vi.fn(),
      update: vi.fn(),
      setActive,
    } as unknown as CategoryRepository;

    service = new DeactivateCategoryService(repository);
  });

  it("throws CategoryNotFoundException when the category does not exist", async () => {
    findById.mockResolvedValue(undefined);

    await expect(service.execute("missing-id")).rejects.toBeInstanceOf(
      CategoryNotFoundException,
    );
  });

  it("sets isActive to false on success", async () => {
    findById.mockResolvedValue(fakeCategory());
    setActive.mockResolvedValue(fakeCategory({ isActive: false }));

    await service.execute("cat1");

    expect(setActive).toHaveBeenCalledWith("cat1", false);
  });

  it("does not deactivate when the category is not found", async () => {
    findById.mockResolvedValue(undefined);

    await expect(service.execute("cat1")).rejects.toThrow();
    expect(setActive).not.toHaveBeenCalled();
  });
});
