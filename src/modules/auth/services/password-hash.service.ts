import * as argon2 from "argon2";

export class PasswordHash {
  async hash(password: string): Promise<string> {
    try {
      const hashedPassword = argon2.hash(password);
      return hashedPassword;
    } catch (ex) {
      throw ex;
    }
  }

  async validade(passwordHash: string, password: string): Promise<boolean> {
    try {
      const hashMatches = argon2.verify(passwordHash, password);
      return hashMatches;
    } catch (ex) {
      throw ex;
    }
  }
}
