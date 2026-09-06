import { and, asc, desc, eq } from "drizzle-orm";

import { db } from "../../db/index.js";
import { addressTable } from "../../db/schema.js";
import type { Address, AddressInsert } from "../../models/index.js";

export class AddressRepository {
  async create(data: AddressInsert): Promise<Address | undefined> {
    const [address] = await db.insert(addressTable).values(data).returning();

    return address;
  }

  async findByUser(userId: string): Promise<Address[]> {
    return db
      .select()
      .from(addressTable)
      .where(eq(addressTable.userId, userId))
      .orderBy(desc(addressTable.isDefault), asc(addressTable.createdAt));
  }

  async findByUserAndId(userId: string, id: string): Promise<Address | undefined> {
    const [address] = await db
      .select()
      .from(addressTable)
      .where(and(eq(addressTable.userId, userId), eq(addressTable.id, id)))
      .limit(1);

    return address;
  }

  async update(id: string, data: Partial<AddressInsert>): Promise<Address | undefined> {
    const [address] = await db
      .update(addressTable)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(addressTable.id, id))
      .returning();

    return address;
  }

  async delete(id: string): Promise<void> {
    await db.delete(addressTable).where(eq(addressTable.id, id));
  }

  async clearDefault(userId: string): Promise<void> {
    await db
      .update(addressTable)
      .set({ isDefault: false })
      .where(eq(addressTable.userId, userId));
  }
}
