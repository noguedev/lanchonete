import type {
  InferInsertModel,
  InferSelectModel,
} from "drizzle-orm";

import { productTable } from "../db/schema.js";

export type Product = InferSelectModel<typeof productTable>;

export type ProductInsert = InferInsertModel<typeof productTable>;
