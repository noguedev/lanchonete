import type {
  InferInsertModel,
  InferSelectModel,
} from "drizzle-orm";

import { roleEnum, userTable } from "../db/schema.js";

export type User = InferSelectModel<typeof userTable>;

export type UserInsert = InferInsertModel<typeof userTable>;

export type UserRole = (typeof roleEnum.enumValues)[number];