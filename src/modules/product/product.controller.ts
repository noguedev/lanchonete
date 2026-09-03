import type { FastifyReply, FastifyRequest } from "fastify";

import { AppError } from "../../models/exception-base.js";
import { makeCreateProductService } from "./factories/create-product-service.factory.js";
import { makeUpdateProductService } from "./factories/update-product-service.factory.js";
import { makeDeactivateProductService } from "./factories/deactivate-product-service.factory.js";
import { makeListProductsService } from "./factories/list-products-service.factory.js";
import { ProductImageRequiredException } from "./exceptions/product-image-required.exception.js";
import { ProductNotFoundException } from "./exceptions/product-not-found.exception.js";
import {
  createProductSchema,
  updateProductSchema,
  productListQuerySchema,
} from "./product.dtos.js";
import type { Product } from "../../models/index.js";
import type { AdminProductResponse, PublicProductResponse } from "./types/product-response.js";



function toAdminProductResponse(product: Product): AdminProductResponse {
  return {
    id: product.id,
    categoryId: product.categoryId,
    name: product.name,
    slug: product.slug,
    description: product.description,
    price: Number(product.price),
    imageUrl: product.imageUrl,
    isAvailable: product.isAvailable,
    isActive: product.isActive,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt ? product.updatedAt.toISOString() : null,
  };
}

function toPublicProductResponse(product: Product): PublicProductResponse {
  return {
    id: product.id,
    categoryId: product.categoryId,
    name: product.name,
    slug: product.slug,
    description: product.description,
    price: Number(product.price),
    imageUrl: product.imageUrl,
    isAvailable: product.isAvailable,
  };
}

function requireProduct(product: Product | undefined): Product {
  if (!product) {
    throw new ProductNotFoundException();
  }

  return product;
}

async function readMultipart(request: FastifyRequest) {
  const values: Record<string, string> = {};
  let file: Buffer | undefined;

  for await (const part of request.parts()) {
    if (part.type === "file") {
      file = await part.toBuffer();
    } else {
      values[part.fieldname] = String(part.value);
    }
  }

  return { values, file };
}

export class ProductController {
  private readonly createProductService = makeCreateProductService();
  private readonly updateProductService = makeUpdateProductService();
  private readonly deactivateProductService = makeDeactivateProductService();
  private readonly listProductsService = makeListProductsService();

  async create(request: FastifyRequest, reply: FastifyReply) {
    const { values, file } = await readMultipart(request);

    if (!file) {
      throw new ProductImageRequiredException();
    }

    const parsed = createProductSchema.safeParse(values);

    if (!parsed.success) {
      throw new AppError(
        parsed.error.issues[0]?.message ?? "Dados do produto inválidos.",
        400,
      );
    }

    await this.createProductService.execute(parsed.data, file);

    return reply.status(201).send();
  }

  async update(request: FastifyRequest, reply: FastifyReply) {
    const { values, file } = await readMultipart(request);
    const id = (request.params as { id: string }).id;

    const parsed = updateProductSchema.safeParse(values);

    if (!parsed.success) {
      throw new AppError(
        parsed.error.issues[0]?.message ?? "Dados do produto inválidos.",
        400,
      );
    }

    const product = await this.updateProductService.execute(id, parsed.data, file);

    return reply
      .status(200)
      .send({ product: toAdminProductResponse(requireProduct(product)) });
  }

  async deactivate(request: FastifyRequest, reply: FastifyReply) {
    const id = (request.params as { id: string }).id;
    const product = await this.deactivateProductService.execute(id);

    return reply
      .status(200)
      .send({ product: toAdminProductResponse(requireProduct(product)) });
  }

  async list(request: FastifyRequest, reply: FastifyReply) {
    const parsed = productListQuerySchema.safeParse(request.query);

    if (!parsed.success) {
      throw new AppError(
        parsed.error.issues[0]?.message ?? "Filtros inválidos.",
        400,
      );
    }

    const { page, limit } = parsed.data;
    const { items, total } = await this.listProductsService.execute({
      page,
      limit,
    });

    return reply
      .status(200)
      .send(buildPaginatedResponse(page, limit, total, items));
  }

  async listBySlug(request: FastifyRequest, reply: FastifyReply) {
    const slug = (request.params as { slug: string }).slug;

    const parsed = productListQuerySchema.safeParse(request.query);

    if (!parsed.success) {
      throw new AppError(
        parsed.error.issues[0]?.message ?? "Filtros inválidos.",
        400,
      );
    }

    const { page, limit } = parsed.data;
    const { items, total } = await this.listProductsService.execute({
      page,
      limit,
      categorySlug: slug,
    });

    return reply
      .status(200)
      .send(buildPaginatedResponse(page, limit, total, items));
  }
}

function buildPaginatedResponse(
  page: number,
  limit: number,
  total: number,
  items: Product[],
) {
  return {
    products: items.map(toPublicProductResponse),
    page,
    limit,
    total,
    totalPages: total === 0 ? 0 : Math.ceil(total / limit),
  };
}
