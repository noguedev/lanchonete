import type { FastifyReply, FastifyRequest } from "fastify";

import { makeCreateCategoryService } from "./factories/create-category-service.factory.js";
import { makeUpdateCategoryService } from "./factories/update-category-service.factory.js";
import { makeDeactivateCategoryService } from "./factories/deactivate-category-service.factory.js";
import { makeListCategoriesService } from "./factories/list-categories-service.factory.js";
import { CategoryNotFoundException } from "./exceptions/category-not-found.exception.js";
import type {
  CreateCategoryDTO,
  UpdateCategoryDTO,
  CategoryParams,
} from "./category.dtos.js";
import type { Category } from "../../models/index.js";

type CategoryResponse = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
};

function toCategoryResponse(category: Category): CategoryResponse {
  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description,
    isActive: category.isActive,
    createdAt: category.createdAt.toISOString(),
    updatedAt: category.updatedAt ? category.updatedAt.toISOString() : null,
  };
}

function requireCategory(category: Category | undefined): Category {
  if (!category) {
    throw new CategoryNotFoundException();
  }

  return category;
}

export class CategoryController {
  private readonly createCategoryService = makeCreateCategoryService();
  private readonly updateCategoryService = makeUpdateCategoryService();
  private readonly deactivateCategoryService = makeDeactivateCategoryService();
  private readonly listCategoriesService = makeListCategoriesService();

  async create(request: FastifyRequest, reply: FastifyReply) {
    const category = await this.createCategoryService.execute(
      request.body as CreateCategoryDTO,
    );

    return reply
      .status(201)
      .send({ category: toCategoryResponse(requireCategory(category)) });
  }

  async update(request: FastifyRequest, reply: FastifyReply) {
    const category = await this.updateCategoryService.execute(
      (request.params as CategoryParams).id,
      request.body as UpdateCategoryDTO,
    );

    return reply
      .status(200)
      .send({ category: toCategoryResponse(requireCategory(category)) });
  }

  async deactivate(request: FastifyRequest, reply: FastifyReply) {
    const category = await this.deactivateCategoryService.execute(
      (request.params as CategoryParams).id,
    );

    return reply
      .status(200)
      .send({ category: toCategoryResponse(requireCategory(category)) });
  }

  async list(request: FastifyRequest, reply: FastifyReply) {
    const categories = await this.listCategoriesService.execute();

    return reply
      .status(200)
      .send({ categories: categories.map(toCategoryResponse) });
  }
}
