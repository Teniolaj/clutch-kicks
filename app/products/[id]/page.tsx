import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCatalog, getProductBySlug } from "@/lib/catalog";
import { ProductDetailClient, ProductDetailWithColor } from "@/components/ProductDetailClient";

// Pages are built on first visit and cached; saving a product in admin refreshes them.
export const revalidate = 300;

// `id` is the product's URL name (slug) set in admin.
// None are built ahead of time; each product page is built on its first visit
// and then cached like the rest of the shop.
export async function generateStaticParams() {
  return [];
}

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductBySlug(id);
  if (!product) return {};
  const title = `${product.brand} ${product.name} | Clutch Kicks`;
  return {
    title,
    description: product.description || undefined,
    openGraph: { title, images: [product.variants[0].images[0]] },
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { id } = await params;
  const catalog = await getCatalog();
  const product = catalog.find((p) => p.slug === id);
  if (!product) notFound();

  const others = catalog.filter((p) => p.id !== product.id);
  const completeTheFit = others.filter((p) => p.silhouette !== product.silhouette).slice(0, 4);
  const sameBrand = others.filter((p) => p.brand === product.brand).slice(0, 4);
  const alsoLike = sameBrand.length > 0 ? sameBrand : others.slice(0, 4);

  const props = { product, completeTheFit, alsoLike };
  return (
    <Suspense fallback={<ProductDetailClient {...props} colorSlug={null} />}>
      <ProductDetailWithColor {...props} />
    </Suspense>
  );
}
