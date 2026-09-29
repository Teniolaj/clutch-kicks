import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProductForm, type FormProduct, type FormVariant, type SizeState } from "../ProductForm";
import { getBrandOptions } from "../brandOptions";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function sameSizes(a: Record<string, SizeState>, b: Record<string, SizeState>): boolean {
  const keys = Object.keys(a);
  return keys.length === Object.keys(b).length && keys.every((eu) => a[eu] === b[eu]);
}

interface DbProduct {
  id: string;
  slug: string;
  brand: string;
  name: string;
  description: string;
  silhouette: string;
  badge: string | null;
  is_published: boolean;
  product_variants: {
    id: string;
    colorway: string;
    swatch_hex: string | null;
    price: number;
    compare_at_price: number | null;
    in_stock: boolean;
    is_default: boolean;
    sort_order: number;
    variant_images: { id: string; storage_path: string; sort_order: number }[];
    variant_sizes: { eu: string; in_stock: boolean; low_stock: boolean }[];
  }[];
}

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!UUID_RE.test(id)) notFound();

  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select(
      `id, slug, brand, name, description, silhouette, badge, is_published,
       product_variants ( id, colorway, swatch_hex, price, compare_at_price, in_stock, is_default, sort_order,
         variant_images ( id, storage_path, sort_order ),
         variant_sizes ( eu, in_stock, low_stock ) )`
    )
    .eq("id", id)
    .maybeSingle();

  if (!data) notFound();
  const p = data as DbProduct;

  const variants: FormVariant[] = [...p.product_variants]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((v) => ({
      id: v.id,
      colorway: v.colorway,
      swatchHex: v.swatch_hex,
      price: String(v.price),
      compareAtPrice: v.compare_at_price === null ? "" : String(v.compare_at_price),
      inStock: v.in_stock,
      isDefault: v.is_default,
      images: [...v.variant_images]
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((img) => ({ id: img.id, storagePath: img.storage_path })),
      sizes: Object.fromEntries(
        v.variant_sizes.map((s): [string, SizeState] => [
          s.eu,
          !s.in_stock ? "out" : s.low_stock ? "low" : "in",
        ])
      ),
      sameAsFirst: false,
    }));

  // Colours saved with exactly colour 1's price and sizes open in "same as colour 1" mode.
  const first = variants[0];
  for (const v of variants.slice(1)) {
    v.sameAsFirst =
      v.price === first.price && v.compareAtPrice === first.compareAtPrice && sameSizes(v.sizes, first.sizes);
  }

  const initial: FormProduct = {
    id: p.id,
    slug: p.slug,
    brand: p.brand,
    name: p.name,
    description: p.description,
    silhouette: p.silhouette,
    badge: p.badge ?? "",
    isPublished: p.is_published,
    variants,
  };

  return <ProductForm initial={initial} isNew={false} brandOptions={await getBrandOptions()} />;
}
