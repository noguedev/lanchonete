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

  async findActiveByHash(
    tokenHash: string,
  ): Promise<RefreshToken | undefined> {
    const [token] = await db
      .select()
      .from(refreshTokenTable)
      .where(
        and(
          eq(refreshTokenTable.tokenHash, tokenHash),
          isNull(refreshTokenTable.revokedAt),
          gt(refreshTokenTable.expiresAt, new Date()),
        ),
      )
      .limit(1);

    return token;
  }

  async revoke(refreshTokenId: string): Promise<void> {
    await db
      .update(refreshTokenTable)
      .set({ revokedAt: new Date() })
      .where(eq(refreshTokenTable.id, refreshTokenId));
  }
}
