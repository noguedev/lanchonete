import type {
  InferInsertModel,
  InferSelectModel,
} from "drizzle-orm";

import { categoryTable } from "../db/schema.js";

export type Category = InferSelectModel<typeof categoryTable>;

export type CategoryInsert = InferInsertModel<typeof categoryTable>;
