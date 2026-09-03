import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

import { InvalidImageException } from "../exceptions/invalid-image.exception.js";
import { ImageTooLargeException } from "../exceptions/image-too-large.exception.js";
import { MAX_IMAGE_SIZE_BYTES } from "../../../config/storage.js";

export type SanitizedImage = {
  buffer: Buffer;
  format: "jpeg" | "png";
  ext: string;
};

export class ImageService {
  constructor(
    private readonly baseDir: string,
    private readonly maxSizeBytes: number = MAX_IMAGE_SIZE_BYTES,
  ) {}

  async sanitize(buffer: Buffer): Promise<SanitizedImage> {
    let format: string | undefined;

    try {
      const metadata = await sharp(buffer).metadata();
      format = metadata.format;
    } catch {
      throw new InvalidImageException();
    }

    if (format !== "jpeg" && format !== "png") {
      throw new InvalidImageException();
    }

    const processed = await sharp(buffer)
      .resize(500, 500)
      .toFormat(format)
      .toBuffer();

    if (processed.length > this.maxSizeBytes) {
      throw new ImageTooLargeException();
    }

    return {
      buffer: processed,
      format,
      ext: format === "jpeg" ? "jpg" : "png",
    };
  }

  async save(image: SanitizedImage, subdir: string): Promise<string> {
    const filename = `${crypto.randomUUID()}.${image.ext}`;
    const targetDir = path.join(this.baseDir, subdir);

    await fs.mkdir(targetDir, { recursive: true });
    await fs.writeFile(path.join(targetDir, filename), image.buffer);

    return `/uploads/${subdir}/${filename}`;
  }
}
