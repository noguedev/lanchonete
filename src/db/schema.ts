import {
  boolean,
  foreignKey,
  pgEnum,
  pgTable,
  timestamp,
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
