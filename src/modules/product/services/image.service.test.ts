import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import sharp from "sharp";

import { ImageService } from "./image.service.js";
import { InvalidImageException } from "../exceptions/invalid-image.exception.js";
import { ImageTooLargeException } from "../exceptions/image-too-large.exception.js";

const makePng = () =>
  sharp({
    create: { width: 500, height: 500, channels: 3, background: { r: 0, g: 0, b: 0 } },
  })
    .png()
    .toBuffer();

const makeJpeg = () =>
  sharp({
    create: { width: 500, height: 500, channels: 3, background: { r: 0, g: 0, b: 0 } },
  })
    .jpeg()
    .toBuffer();

const makeWebp = () =>
  sharp({
    create: { width: 500, height: 500, channels: 3, background: { r: 0, g: 0, b: 0 } },
  })
    .webp()
    .toBuffer();

describe("ImageService", () => {
  let service: ImageService;
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "lanchonete-img-"));
    service = new ImageService(tmpDir);
  });

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  describe("sanitize", () => {
    it("accepts a PNG and returns png ext", async () => {
      const result = await service.sanitize(await makePng());

      expect(result.format).toBe("png");
      expect(result.ext).toBe("png");
      expect(Buffer.isBuffer(result.buffer)).toBe(true);
    });

    it("accepts a JPEG and returns jpg ext", async () => {
      const result = await service.sanitize(await makeJpeg());

      expect(result.format).toBe("jpeg");
      expect(result.ext).toBe("jpg");
    });

    it("outputs a 500x500 image", async () => {
      const result = await service.sanitize(await makePng());
      const metadata = await sharp(result.buffer).metadata();

      expect(metadata.width).toBe(500);
      expect(metadata.height).toBe(500);
    });

    it("rejects a non-image buffer", async () => {
      await expect(service.sanitize(Buffer.from("isso nao e uma imagem"))).rejects.toBeInstanceOf(
        InvalidImageException,
      );
    });

    it("rejects formats other than JPEG/PNG (webp)", async () => {
      await expect(service.sanitize(await makeWebp())).rejects.toBeInstanceOf(
        InvalidImageException,
      );
    });

    it("rejects images larger than the allowed size", async () => {
      const tiny = new ImageService(tmpDir, 10);

      await expect(tiny.sanitize(await makePng())).rejects.toBeInstanceOf(
        ImageTooLargeException,
      );
    });
  });

  describe("save", () => {
    it("writes the file and returns the public url", async () => {
      const image = await service.sanitize(await makePng());
      const url = await service.save(image, "products");

      expect(url).toMatch(/^\/uploads\/products\/[0-9a-f-]{36}\.png$/);

      const filename = url.split("/").pop()!;
      const filePath = path.join(tmpDir, "products", filename);
      await expect(fs.access(filePath)).resolves.toBeUndefined();
    });
  });
});
