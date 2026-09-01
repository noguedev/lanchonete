import { and, eq, gt, isNull } from "drizzle-orm";

import { db } from "../../db/index.js";
import { refreshTokenTable } from "../../db/schema.js";
import type {
  RefreshToken,
  RefreshTokenInsert,
} from "../../models/index.js";

export class RefreshTokenRepository {
  async create(data: RefreshTokenInsert): Promise<RefreshToken | undefined> {
    const [token] = await db
      .insert(refreshTokenTable)
      .values(data)
      .returning();

    return token;
  }

  async findByHash(tokenHash: string): Promise<RefreshToken | undefined> {
    const [token] = await db
      .select()
      .from(refreshTokenTable)
      .where(eq(refreshTokenTable.tokenHash, tokenHash))
      .limit(1);

    return token;
  }

  async findActiveByUserId(userId: string): Promise<RefreshToken[]> {
    return db
      .select()
      .from(refreshTokenTable)
      .where(
        and(
          eq(refreshTokenTable.userId, userId),
          isNull(refreshTokenTable.revokedAt),
          gt(refreshTokenTable.expiresAt, new Date()),
        ),
      );
  }

  async findActive(): Promise<RefreshToken[]> {
    return db
      .select()
      .from(refreshTokenTable)
      .where(
        and(
          isNull(refreshTokenTable.revokedAt),
          gt(refreshTokenTable.expiresAt, new Date()),
        ),
      );
  }

  async revoke(refreshTokenId: string): Promise<void> {
    await db
      .update(refreshTokenTable)
      .set({ revokedAt: new Date() })
      .where(eq(refreshTokenTable.id, refreshTokenId));
  }
}

