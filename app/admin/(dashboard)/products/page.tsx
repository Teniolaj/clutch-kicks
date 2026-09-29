import Link from "next/link";
import { Plus, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { productImageUrl } from "@/lib/storage";
import { ProductsTable, type ProductRow } from "./ProductsTable";

interface DbProduct {
  id: string;
  slug: string;
  brand: string;
  name: string;
  is_published: boolean;
  product_variants: {
    colorway: string;
    price: number;
    in_stock: boolean;
    is_default: boolean;
    sort_order: number;
    variant_images: { storage_path: string; sort_order: number }[];
  }[];
}

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const { saved } = await searchParams;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(
      `id, slug, brand, name, is_published,
       product_variants ( colorway, price, in_stock, is_default, sort_order,
         variant_images ( storage_path, sort_order ) )`
    )
    .order("created_at", { ascending: false });

  const rows: ProductRow[] = ((data ?? []) as DbProduct[]).map((p) => {
    const variants = [...p.product_variants].sort((a, b) => a.sort_order - b.sort_order);
    const main = variants.find((v) => v.is_default) ?? variants[0];
    const mainImage = main?.variant_images.sort((a, b) => a.sort_order - b.sort_order)[0];
    const prices = variants.map((v) => v.price);
    return {
      id: p.id,
      slug: p.slug,
      brand: p.brand,
      name: p.name,
      colorways: variants.map((v) => v.colorway),
      thumb: mainImage ? productImageUrl(mainImage.storage_path) : null,
      minPrice: prices.length ? Math.min(...prices) : 0,
      maxPrice: prices.length ? Math.max(...prices) : 0,
      isPublished: p.is_published,
      inStock: variants.some((v) => v.in_stock),
    };
  });

  return (
    <div className="max-w-6xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="font-mono text-xs uppercase tracking-ultra-wide text-ink-muted">
            {rows.length} {rows.length === 1 ? "Product" : "Products"}
          </span>
          <h1 className="font-display uppercase text-[clamp(28px,4vw,40px)] leading-none mt-1">Products</h1>
        </div>
        <Link
          href="/admin/products/new/"
          className="inline-flex items-center gap-2 h-11 px-5 bg-ink text-ink-invert border-2 border-ink font-sans text-sm font-bold uppercase tracking-wide hover:bg-transparent hover:text-ink transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </Link>
      </div>

      {saved && (
        <p className="mt-6 flex items-center gap-2 border-2 border-ink bg-volt px-4 py-3 font-sans text-sm font-semibold">
          <CheckCircle2 className="w-4 h-4" />
          Product saved.
        </p>
      )}

      {error ? (
        <p role="alert" className="mt-6 border-2 border-red text-red font-sans text-sm p-4">
          Couldn&apos;t load products: {error.message}
        </p>
      ) : (
        <ProductsTable rows={rows} />
      )}
    </div>
  );
}
