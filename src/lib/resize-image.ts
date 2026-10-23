// src/lib/resize-image.ts
// Browser-only: shrinks photos before they're uploaded. A phone photo is
// often 3–8 MB, well over the upload limits, and far bigger than a menu needs.

export interface ResizeOptions {
  // Longest side, in pixels, after resizing.
  maxSize: number;
  // Encoder quality between 0 and 1.
  quality?: number;
}

export const ITEM_PHOTO: ResizeOptions = { maxSize: 1600, quality: 0.82 };
export const LOGO: ResizeOptions = { maxSize: 1024, quality: 0.9 };

// Already small enough that re-encoding wouldn't help.
const KEEP_BELOW_BYTES = 300 * 1024;

const canvasToBlob = (canvas: HTMLCanvasElement, type: string, quality: number) =>
  new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));

const renameTo = (name: string, extension: string) =>
  `${name.replace(/\.[^.]+$/, "") || "image"}.${extension}`;

/**
 * Returns a smaller copy of an image, or the original file when it can't or
 * needn't be shrunk (animated GIFs, SVGs, small files, formats the browser
 * can't read). Never returns a bigger file than it was given.
 */
export async function resizeImage(file: File, { maxSize, quality = 0.85 }: ResizeOptions): Promise<File> {
  if (!file.type.startsWith("image/") || file.type === "image/gif" || file.type === "image/svg+xml") {
    return file;
  }

  let bitmap: ImageBitmap;
  try {
    // "from-image" applies the photo's EXIF rotation, so it isn't sideways.
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    return file; // e.g. HEIC in a browser that can't decode it
  }

  const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
  if (scale === 1 && file.size <= KEEP_BELOW_BYTES) {
    bitmap.close();
    return file;
  }

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const context = canvas.getContext("2d");
  if (!context) {
    bitmap.close();
    return file;
  }
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  // WebP keeps photos and transparent logos small. Browsers that can't
  // encode it hand back a PNG instead, so fall back to JPEG for those.
  let blob = await canvasToBlob(canvas, "image/webp", quality);
  let extension = "webp";
  if (blob?.type !== "image/webp") {
    // JPEG has no transparency, which would turn see-through parts black;
    // paint white behind the image instead.
    context.globalCompositeOperation = "destination-over";
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    blob = await canvasToBlob(canvas, "image/jpeg", quality);
    extension = "jpg";
  }

  if (!blob || blob.size >= file.size) return file;
  return new File([blob], renameTo(file.name, extension), {
    type: blob.type,
    lastModified: file.lastModified,
  });
}

/** For UploadThing's onBeforeUploadBegin. */
export const resizeImages = (options: ResizeOptions) => (files: File[]) =>
  Promise.all(files.map((file) => resizeImage(file, options)));
