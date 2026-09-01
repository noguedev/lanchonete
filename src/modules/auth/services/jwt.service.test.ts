import { describe, it, expect, beforeAll, afterAll } from "vitest";
import Fastify from "fastify";
import type { FastifyInstance } from "fastify";
import jwt from "@fastify/jwt";

import { JwtService } from "./jwt.service.js";
import type { JwtPayload } from "../../../types/jwt.js";

describe("JwtService", () => {
  let fastify: FastifyInstance;
  let service: JwtService;

  beforeAll(async () => {
    fastify = Fastify();
    await fastify.register(jwt, {
      secret: "test-secret",
      sign: { expiresIn: "15m" },
    });
    await fastify.ready();
    service = new JwtService(fastify);
  });

  afterAll(async () => {
    await fastify.close();
  });

  it("generates a signed access token containing sub and role", async () => {
    const token = await service.generateAccessToken({ id: "u1", role: "ADMIN" });

    expect(typeof token).toBe("string");

    const payload = fastify.jwt.verify<JwtPayload>(token);
    expect(payload.sub).toBe("u1");
    expect(payload.role).toBe("ADMIN");
  });

  it("generates different tokens for different users", async () => {
    const [a, b] = await Promise.all([
      service.generateAccessToken({ id: "u1", role: "ADMIN" }),
      service.generateAccessToken({ id: "u2", role: "CUSTOMER" }),
    ]);

    expect(a).not.toBe(b);
  });

  it("rejects a forged token with an invalid signature", () => {
    expect(() => fastify.jwt.verify("assinatura.invalida.aqui")).toThrow();
  });

  it("generates refresh tokens in a 128-character hex format", () => {
    const token = service.generateRefreshToken();

    expect(token).toMatch(/^[0-9a-f]{128}$/);
  });

  it("generates unique refresh tokens on each call", () => {
    expect(service.generateRefreshToken()).not.toBe(
      service.generateRefreshToken(),
    );
  });
});
