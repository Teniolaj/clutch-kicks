export const PRODUCT_IMAGES_BUCKET = "product-images";

// Public URL for a file in the product-images bucket (the bucket is public-read).
export function productImageUrl(storagePath: string): string {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${PRODUCT_IMAGES_BUCKET}/${storagePath}`;
}
