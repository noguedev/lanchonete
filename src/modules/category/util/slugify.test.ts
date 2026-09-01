import { describe, it, expect } from "vitest";

import { slugify } from "./slugify.js";

describe("slugify", () => {
  it("converts accented and uppercase text into a lower hyphenated slug", () => {
    expect(slugify("Lanches Artesanais")).toBe("lanches-artesanais");
    expect(slugify("Café & Açaí")).toBe("cafe-acai");
  });

  it("normalizes extra spaces and hyphens and trims edges", () => {
    expect(slugify("  Bebidas   Geladas  ")).toBe("bebidas-geladas");
    expect(slugify("---porções---")).toBe("porcoes");
  });

  it("removes special characters", () => {
    expect(slugify("Doces, Bollos & Tortas!")).toBe("doces-bollos-tortas");
  });

  it("handles already clean slugs", () => {
    expect(slugify("bebidas")).toBe("bebidas");
  });
});
