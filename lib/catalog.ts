import "server-only";
import { cache } from "react";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { productImageUrl } from "@/lib/storage";
import type { Badge, Silhouette } from "@/data/products";
import type { CatalogProduct } from "@/lib/catalog-types";

// The shop always reads as an anonymous visitor (no cookies), so an admin
// browsing the site sees exactly what customers see, drafts excluded, and pages
// can be cached. Admin saves call revalidatePath to refresh them.
function publicClient() {
  return createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

interface Row {
  id: string;
  slug: string;
  brand: string;
  name: string;
  description: string;
  silhouette: Silhouette;
  badge: Exclude<Badge, null> | null;
  sort_order: number;
  created_at: string;
  product_variants: {
    id: string;
    slug: string;
    colorway: string;
    swatch_hex: string | null;
    price: number;
    compare_at_price: number | null;
    in_stock: boolean;
    is_default: boolean;
    sort_order: number;
    variant_images: { storage_path: string; sort_order: number }[];
    variant_sizes: { eu: string; in_stock: boolean; low_stock: boolean; sort_order: number }[];
  }[];
}

interface PriceRow {
  variant_id: string;
  final_price: number;
  compare_at_price: number | null;
  promotion_name: string | null;
}

const bySortOrder = (a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order;

/** Every published product, newest first. Deduplicated per request. */
export const getCatalog = cache(async (): Promise<CatalogProduct[]> => {
  const supabase = publicClient();
  const [products, prices] = await Promise.all([
    supabase
      .from("products")
      .select(
        `id, slug, brand, name, description, silhouette, badge, sort_order, created_at,
         product_variants ( id, slug, colorway, swatch_hex, price, compare_at_price, in_stock, is_default, sort_order,
           variant_images ( storage_path, sort_order ),
           variant_sizes ( eu, in_stock, low_stock, sort_order ) )`
      )
      .eq("is_published", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false }),
    supabase.from("variant_prices").select("variant_id, final_price, compare_at_price, promotion_name"),
  ]);

  if (products.error) throw new Error(`Couldn't load products: ${products.error.message}`);
  if (prices.error) throw new Error(`Couldn't load prices: ${prices.error.message}`);

  const priceById = new Map((prices.data as PriceRow[]).map((p) => [p.variant_id, p]));

  return (products.data as Row[]).flatMap((p): CatalogProduct[] => {
    const variants = [...p.product_variants]
      .sort((a, b) => Number(b.is_default) - Number(a.is_default) || bySortOrder(a, b))
      .map((v) => {
        const price = priceById.get(v.id);
        const sizes = [...v.variant_sizes]
          .sort((a, b) => parseFloat(a.eu) - parseFloat(b.eu))
          .map((s) => ({ eu: s.eu, soldOut: !v.in_stock || !s.in_stock, lowStock: s.low_stock }));
        return {
          id: v.id,
          slug: v.slug,
          colorway: v.colorway,
          swatchHex: v.swatch_hex,
          price: price?.final_price ?? v.price,
          compareAtPrice: price ? price.compare_at_price : v.compare_at_price,
          promotionName: price?.promotion_name ?? null,
          inStock: v.in_stock && sizes.some((s) => !s.soldOut),
          images: [...v.variant_images].sort(bySortOrder).map((img) => productImageUrl(img.storage_path)),
          sizes,
        };
      })
      // A colour with no photo can't be shown on a card.
      .filter((v) => v.images.length > 0);

    if (variants.length === 0) return [];
    return [
      {
        id: p.id,
        slug: p.slug,
        brand: p.brand,
        name: p.name,
        description: p.description,
        silhouette: p.silhouette,
        badge: p.badge,
        createdAt: p.created_at,
        variants,
      },
    ];
  });
});

export async function getProductBySlug(slug: string): Promise<CatalogProduct | undefined> {
  return (await getCatalog()).find((p) => p.slug === slug);
}
