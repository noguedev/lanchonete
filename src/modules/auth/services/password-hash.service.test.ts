import { describe, it, expect } from "vitest";

import { PasswordHash } from "./password-hash.service.js";

describe("PasswordHash", () => {
  const service = new PasswordHash();
  const password = "senha-super-secreta";

  it("generates an argon2 hash (does not expose the password)", async () => {
    const result = await service.hash(password);

    expect(result).toMatch(/^\$argon2/);
    expect(result).not.toBe(password);
  });

  it("generates different hashes for the same password (random salt)", async () => {
    const [a, b] = await Promise.all([
      service.hash(password),
      service.hash(password),
    ]);

    expect(a).not.toBe(b);
  });

  it("validates the correct password as true", async () => {
    const hash = await service.hash(password);

    await expect(service.validade(hash, password)).resolves.toBe(true);
  });

  it("validates an incorrect password as false", async () => {
    const hash = await service.hash(password);

    await expect(service.validade(hash, "senha-errada")).resolves.toBe(false);
  });

  it("rethrows errors for an invalid hash", async () => {
    await expect(service.validade("hash-invalido", password)).rejects.toThrow();
  });

  it("rejects an empty password during verification", async () => {
    const hash = await service.hash(password);

    await expect(service.validade(hash, "")).resolves.toBe(false);
    await expect(service.validade(hash, "")).not.toBe(true);
  });
});
