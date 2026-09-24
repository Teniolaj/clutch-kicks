import { notFound } from "next/navigation";
import { products } from "@/data/products";
import { ProductDetailClient } from "@/components/ProductDetailClient";

export function generateStaticParams() {
  return products.map((product) => ({ id: product.id }));
}

export default function ProductDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const product = products.find((p) => p.id === params.id);

  if (!product) {
    notFound();
  }

  return <ProductDetailClient product={product} />;
}
