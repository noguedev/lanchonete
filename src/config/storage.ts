import path from "node:path";

export const UPLOADS_DIR = path.resolve(process.cwd(), "uploads");

export const PRODUCT_IMAGES_SUBDIR = "products";

export const MAX_IMAGE_SIZE_BYTES = 1_000_000;
