import { db } from "../../db/index.js";
import { userTable } from "../../db/schema.js";
import type { UserInsert } from "../../models/index.js";
import { eq } from "drizzle-orm";

export class UserRepository {
  async createUser(data: UserInsert) {
    const [user] = await db.insert(userTable).values(data).returning();
    return user;
  }

  async findByEmail(email: string) {
    const user = await db
      .select()
      .from(userTable)
      .where(eq(userTable.email, email));

      return user;
  }
}
