import { eq } from "drizzle-orm";

import { db } from "../../db/index.js";
import { categoryTable } from "../../db/schema.js";
import type { Category, CategoryInsert } from "../../models/index.js";

export class CategoryRepository {
  async create(data: CategoryInsert): Promise<Category | undefined> {
    const [category] = await db.insert(categoryTable).values(data).returning();

    return category;
  }

  async findById(id: string): Promise<Category | undefined> {
    const [category] = await db
      .select()
      .from(categoryTable)
      .where(eq(categoryTable.id, id))
      .limit(1);

    return category;
  }

  async findBySlug(slug: string): Promise<Category | undefined> {
    const [category] = await db
      .select()
      .from(categoryTable)
      .where(eq(categoryTable.slug, slug))
      .limit(1);

    return category;
  }

  async findActive(): Promise<Category[]> {
    return db
      .select()
      .from(categoryTable)
      .where(eq(categoryTable.isActive, true));
  }

  async update(
    id: string,
    data: Partial<CategoryInsert>,
  ): Promise<Category | undefined> {
    const [category] = await db
      .update(categoryTable)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(categoryTable.id, id))
      .returning();

    return category;
  }

  async setActive(
    id: string,
    isActive: boolean,
  ): Promise<Category | undefined> {
    const [category] = await db
      .update(categoryTable)
      .set({ isActive, updatedAt: new Date() })
      .where(eq(categoryTable.id, id))
      .returning();

    return category;
  }
}
