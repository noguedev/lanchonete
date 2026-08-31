import type {
  InferInsertModel,
  InferSelectModel,
} from "drizzle-orm";

import { refreshTokenTable } from "../db/schema.js";

export type RefreshToken = InferSelectModel<typeof refreshTokenTable>;

export type RefreshTokenInsert = InferInsertModel<typeof refreshTokenTable>;
