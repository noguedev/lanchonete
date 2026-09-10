import * as argon2 from "argon2";

export class PasswordHash {
  async hash(password: string): Promise<string> {
    return argon2.hash(password);
  }

  async validate(passwordHash: string, password: string): Promise<boolean> {
    return argon2.verify(passwordHash, password);
  }
}
