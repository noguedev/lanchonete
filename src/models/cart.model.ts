import type {
  InferInsertModel,
  InferSelectModel,
} from "drizzle-orm";

import { cartItemTable, cartTable } from "../db/schema.js";

export type Cart = InferSelectModel<typeof cartTable>;

export type CartInsert = InferInsertModel<typeof cartTable>;

export type CartItem = InferSelectModel<typeof cartItemTable>;

export type CartItemInsert = InferInsertModel<typeof cartItemTable>;
