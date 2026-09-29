// Shrinks a photo in the browser before upload so phone pictures (often 5–12 MB)
// fit the bucket's 5 MB limit and load fast on the shop. Prefers WebP; browsers
// that can't encode WebP (older Safari) fall back to JPEG.
export async function resizeImage(file: File, maxSize = 1600, quality = 0.85): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not process image");
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const webp = await toBlob(canvas, "image/webp", quality);
  if (webp.type === "image/webp") return webp;
  return toBlob(canvas, "image/jpeg", quality);
}

function toBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Could not process image"))),
      type,
      quality
    )
  );
}
