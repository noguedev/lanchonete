import type { FastifyInstance } from "fastify";
import crypto from "node:crypto";

export class JwtService {
  constructor(private readonly fastify: FastifyInstance) {}

  async generateAccessToken(user: { id: string; role: string }) {
    return this.fastify.jwt.sign({
      sub: user.id,
      role: user.role,
    });
  }

  generateRefreshToken() {
    return crypto.randomBytes(64).toString("hex");
  }
}
