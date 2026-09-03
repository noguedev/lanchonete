import { UPLOADS_DIR, MAX_IMAGE_SIZE_BYTES } from "../../../config/storage.js";
import { ImageService } from "../services/image.service.js";

export function makeImageService() {
  return new ImageService(UPLOADS_DIR, MAX_IMAGE_SIZE_BYTES);
}
