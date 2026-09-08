import {
  boolean,
  foreignKey,
  integer,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["ADMIN", "EMPLOYEE", "CUSTOMER"]);

export const userTable = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    name: varchar("name", { length: 100 }).notNull(),

    email: varchar("email", { length: 150 }).unique().notNull(),

    phone: varchar("phone", { length: 20 }),

    passwordHash: varchar("password_hash", { length: 255 }).notNull(),

    role: roleEnum("role").notNull().default("CUSTOMER"),

    isActive: boolean("is_active").notNull().default(true),

    isBanned: boolean("is_banned").notNull().default(false),

    bannedAt: timestamp("banned_at"),

    bannedBy: uuid("banned_by"),

    createdAt: timestamp("created_at").notNull().defaultNow(),

    updatedAt: timestamp("updated_at"),
  },

  (table) => ({
    bannedByFk: foreignKey({
      columns: [table.bannedBy],
      foreignColumns: [table.id],
      name: "users_banned_by_fk",
    }),
  }),
);

export const refreshTokenTable = pgTable("refresh_tokens", {
  id: uuid("id").primaryKey().defaultRandom(),

  userId: uuid("user_id")
    .notNull()
    .references(() => userTable.id, { onDelete: "cascade" }),

  tokenHash: varchar("token_hash", { length: 255 }).unique().notNull(),

  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),

  revokedAt: timestamp("revoked_at", { withTimezone: true }),

  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),

  userAgent: varchar("user_agent", { length: 255 }),

  ipAddress: varchar("ip_address", { length: 45 }),
});

export const categoryTable = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),

  name: varchar("name", { length: 100 }).notNull(),

  slug: varchar("slug", { length: 100 }).unique().notNull(),

  description: text("description"),

  isActive: boolean("is_active").notNull().default(true),

  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),

  updatedAt: timestamp("updated_at", { withTimezone: true }),
});

export const productTable = pgTable("products", {
  id: uuid("id").primaryKey().defaultRandom(),

  categoryId: uuid("category_id")
    .notNull()
    .references(() => categoryTable.id, { onDelete: "cascade" }),

  name: varchar("name", { length: 100 }).notNull(),

  slug: varchar("slug", { length: 100 }).unique().notNull(),

  description: text("description"),

  price: numeric("price", { precision: 10, scale: 2 }).notNull(),

  imageUrl: varchar("image_url", { length: 255 }),

  isAvailable: boolean("is_available").notNull().default(true),

  isActive: boolean("is_active").notNull().default(true),

  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),

  updatedAt: timestamp("updated_at", { withTimezone: true }),
});

export const addressTable = pgTable("addresses", {
  id: uuid("id").primaryKey().defaultRandom(),

  userId: uuid("user_id")
    .notNull()
    .references(() => userTable.id, { onDelete: "cascade" }),

  label: varchar("label", { length: 50 }),

  recipientName: varchar("recipient_name", { length: 100 }),

  phone: varchar("phone", { length: 20 }),

  street: varchar("street", { length: 150 }).notNull(),

  number: varchar("number", { length: 20 }).notNull(),

  complement: varchar("complement", { length: 100 }),

  neighborhood: varchar("neighborhood", { length: 100 }),

  city: varchar("city", { length: 100 }).notNull(),

  state: varchar("state", { length: 2 }).notNull(),

  postalCode: varchar("postal_code", { length: 10 }).notNull(),

  isDefault: boolean("is_default").notNull().default(false),

  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),

  updatedAt: timestamp("updated_at", { withTimezone: true }),
});

export const cartTable = pgTable("carts", {
  id: uuid("id").primaryKey().defaultRandom(),

  userId: uuid("user_id")
    .notNull()
    .unique()
    .references(() => userTable.id, { onDelete: "cascade" }),

  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),

  updatedAt: timestamp("updated_at", { withTimezone: true }),
});

export const cartItemTable = pgTable(
  "cart_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    cartId: uuid("cart_id")
      .notNull()
      .references(() => cartTable.id, { onDelete: "cascade" }),

    productId: uuid("product_id")
      .notNull()
      .references(() => productTable.id, { onDelete: "cascade" }),

    quantity: integer("quantity").notNull().default(1),

    unitPrice: numeric("unit_price", { precision: 10, scale: 2 }).notNull(),

    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),

    updatedAt: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => ({
    uniqueCartProduct: uniqueIndex("cart_items_cart_product_unique").on(
      table.cartId,
      table.productId,
    ),
  }),
);
