import { and, count, eq } from "drizzle-orm";

import { db } from "../../db/index.js";
import { productTable } from "../../db/schema.js";
import type { Product, ProductInsert } from "../../models/index.js";

export type ProductPage = {
  items: Product[];
  total: number;
};

export class ProductRepository {
  async create(data: ProductInsert): Promise<Product | undefined> {
    const [product] = await db.insert(productTable).values(data).returning();

    return product;
  }

  async findById(id: string): Promise<Product | undefined> {
    const [product] = await db
      .select()
      .from(productTable)
      .where(eq(productTable.id, id))
      .limit(1);

    return product;
  }

  async findBySlug(slug: string): Promise<Product | undefined> {
    const [product] = await db
      .select()
      .from(productTable)
      .where(eq(productTable.slug, slug))
      .limit(1);

    return product;
  }

  async listActivePaginated(
    limit: number,
    offset: number,
    categoryId?: string,
  ): Promise<ProductPage> {
    const where = categoryId
      ? and(
          eq(productTable.isActive, true),
          eq(productTable.categoryId, categoryId),
        )
      : eq(productTable.isActive, true);

    const [items, totalRows] = await Promise.all([
      db
        .select()
        .from(productTable)
        .where(where)
        .limit(limit)
        .offset(offset),
      db
        .select({ count: count() })
        .from(productTable)
        .where(where),
    ]);

    return {
      items,
      total: Number(totalRows[0]?.count ?? 0),
    };
  }

  async update(
    id: string,
    data: Partial<ProductInsert>,
  ): Promise<Product | undefined> {
    const [product] = await db
      .update(productTable)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(productTable.id, id))
      .returning();

    return product;
  }

  async setActive(
    id: string,
    isActive: boolean,
  ): Promise<Product | undefined> {
    const [product] = await db
      .update(productTable)
      .set({ isActive, updatedAt: new Date() })
      .where(eq(productTable.id, id))
      .returning();

    return product;
  }
}
