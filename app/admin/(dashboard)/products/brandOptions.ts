import "server-only";
import { createClient } from "@/lib/supabase/server";
import { products as staticProducts } from "@/data/products";

// Brands to suggest even before any product of theirs has been uploaded.
const EXTRA_BRANDS = ["Vans", "Rick Owens"];

// Brand suggestions for the form: brands already in the database plus the ones
// from the original static catalogue, so spelling stays consistent.
export async function getBrandOptions(): Promise<string[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("products").select("brand");
  const brands = [
    ...((data ?? []) as { brand: string }[]).map((p) => p.brand),
    ...staticProducts.map((p) => p.brand),
    ...EXTRA_BRANDS,
  ];
  return Array.from(new Set(brands)).sort((a, b) => a.localeCompare(b));
}
