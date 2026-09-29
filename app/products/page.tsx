import { Suspense } from "react";
import { getCatalog } from "@/lib/catalog";
import { ProductsBrowser } from "@/components/ProductsBrowser";

// Cached and refreshed whenever a product is saved in admin.
export const revalidate = 300;

export default async function ProductsPage() {
  const products = await getCatalog();
  return (
    <Suspense fallback={null}>
      <ProductsBrowser products={products} />
    </Suspense>
  );
}
