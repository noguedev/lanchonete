import type {
  InferInsertModel,
  InferSelectModel,
} from "drizzle-orm";

import { userTable } from "../db/schema.js";

export type User = InferSelectModel<typeof userTable>;

export type UserInsert = InferInsertModel<typeof userTable>;