import type {
  InferInsertModel,
  InferSelectModel,
} from "drizzle-orm";

import { addressTable } from "../db/schema.js";

export type Address = InferSelectModel<typeof addressTable>;

export type AddressInsert = InferInsertModel<typeof addressTable>;
