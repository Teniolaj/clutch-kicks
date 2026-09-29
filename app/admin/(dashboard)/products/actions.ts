"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin/requireAdmin";
import { PRODUCT_IMAGES_BUCKET } from "@/lib/storage";
import { FORM_ERROR, fieldErrorsFromIssues, productSchema, type FieldErrors, type SaveResult } from "./schema";

function revalidateCatalog() {
  revalidatePath("/admin", "layout");
  revalidatePath("/", "layout");
}

function friendlyDbError(error: { code?: string; message: string }): FieldErrors {
  if (error.code === "23505") {
    if (error.message.includes("products_slug_key")) {
      return {
        slug: "Another product already uses this URL name. If it's the same shoe in a new colour, add the colour to that product instead.",
      };
    }
    return { variants: "Two colours on this product have the same name." };
  }
  return { [FORM_ERROR]: `Database error: ${error.message}` };
}

function inputVariantIds(input: unknown): string[] {
  const variants = (input as { variants?: unknown })?.variants;
  return Array.isArray(variants) ? variants.map((v) => String((v as { id?: unknown })?.id ?? "")) : [];
}

export async function saveProduct(input: unknown): Promise<SaveResult> {
  const parsed = productSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, errors: fieldErrorsFromIssues(parsed.error.issues, inputVariantIds(input)) };
  }
  const p = parsed.data;

  let supabase;
  try {
    supabase = await requireAdmin();
  } catch (e) {
    return { ok: false, errors: { [FORM_ERROR]: (e as Error).message } };
  }

  // 1. Product row
  const { error: productError } = await supabase.from("products").upsert({
    id: p.id,
    slug: p.slug,
    brand: p.brand,
    name: p.name,
    description: p.description,
    silhouette: p.silhouette,
    badge: p.badge,
    is_published: p.isPublished,
  });
  if (productError) return { ok: false, errors: friendlyDbError(productError) };

  // 2. Work out which saved variants/images were removed in the form
  const { data: existing, error: existingError } = await supabase
    .from("product_variants")
    .select("id, variant_images ( id, storage_path )")
    .eq("product_id", p.id);
  if (existingError) return { ok: false, errors: friendlyDbError(existingError) };

  const keepVariantIds = new Set(p.variants.map((v) => v.id));
  const keepImageIds = new Set(p.variants.flatMap((v) => v.images.map((img) => img.id)));
  const existingVariants = (existing ?? []) as {
    id: string;
    variant_images: { id: string; storage_path: string }[];
  }[];

  const removedPaths = existingVariants.flatMap((v) =>
    v.variant_images.filter((img) => !keepImageIds.has(img.id)).map((img) => img.storage_path)
  );
  const removedVariantIds = existingVariants.filter((v) => !keepVariantIds.has(v.id)).map((v) => v.id);

  if (removedVariantIds.length) {
    const { error } = await supabase.from("product_variants").delete().in("id", removedVariantIds);
    if (error) return { ok: false, errors: friendlyDbError(error) };
  }

  // 3. Variants. Clear the default flag first so moving it between colours
  //    doesn't trip the one-default-per-product index mid-upsert.
  await supabase.from("product_variants").update({ is_default: false }).eq("product_id", p.id);

  const { error: variantError } = await supabase.from("product_variants").upsert(
    p.variants.map((v, i) => ({
      id: v.id,
      product_id: p.id,
      slug: v.slug,
      colorway: v.colorway,
      swatch_hex: v.swatchHex,
      price: v.price,
      compare_at_price: v.compareAtPrice,
      in_stock: v.inStock,
      is_default: v.isDefault,
      sort_order: i,
    }))
  );
  if (variantError) return { ok: false, errors: friendlyDbError(variantError) };

  const variantIds = p.variants.map((v) => v.id);

  // 4. Images: drop removed rows, upsert the rest in display order
  let deleteImages = supabase.from("variant_images").delete().in("variant_id", variantIds);
  if (keepImageIds.size) deleteImages = deleteImages.not("id", "in", `(${Array.from(keepImageIds).join(",")})`);
  const { error: imageDeleteError } = await deleteImages;
  if (imageDeleteError) return { ok: false, errors: friendlyDbError(imageDeleteError) };

  const imageRows = p.variants.flatMap((v) =>
    v.images.map((img, i) => ({
      id: img.id,
      variant_id: v.id,
      storage_path: img.storagePath,
      alt: `${p.brand} ${p.name} — ${v.colorway}`,
      sort_order: i,
    }))
  );
  if (imageRows.length) {
    const { error } = await supabase.from("variant_images").upsert(imageRows);
    if (error) return { ok: false, errors: friendlyDbError(error) };
  }

  // 5. Sizes: replace wholesale (small rows, no references to them)
  const { error: sizeDeleteError } = await supabase.from("variant_sizes").delete().in("variant_id", variantIds);
  if (sizeDeleteError) return { ok: false, errors: friendlyDbError(sizeDeleteError) };

  const { error: sizeError } = await supabase.from("variant_sizes").insert(
    p.variants.flatMap((v) =>
      v.sizes.map((s, i) => ({
        variant_id: v.id,
        eu: s.eu,
        in_stock: s.inStock,
        low_stock: s.lowStock,
        sort_order: i,
      }))
    )
  );
  if (sizeError) return { ok: false, errors: friendlyDbError(sizeError) };

  // 6. Remove photos that are no longer used
  if (removedPaths.length) {
    await supabase.storage.from(PRODUCT_IMAGES_BUCKET).remove(removedPaths);
  }

  revalidateCatalog();
  return { ok: true, id: p.id };
}

export async function setProductPublished(productId: string, isPublished: boolean) {
  const supabase = await requireAdmin();
  const { error } = await supabase.from("products").update({ is_published: isPublished }).eq("id", productId);
  if (error) throw new Error(error.message);
  revalidateCatalog();
}

// Product-level stock switch: flips every colour at once.
export async function setProductInStock(productId: string, inStock: boolean) {
  const supabase = await requireAdmin();
  const { error } = await supabase.from("product_variants").update({ in_stock: inStock }).eq("product_id", productId);
  if (error) throw new Error(error.message);
  revalidateCatalog();
}

export async function deleteProduct(productId: string) {
  const supabase = await requireAdmin();

  const { data } = await supabase
    .from("product_variants")
    .select("variant_images ( storage_path )")
    .eq("product_id", productId);
  const paths = ((data ?? []) as { variant_images: { storage_path: string }[] }[]).flatMap((v) =>
    v.variant_images.map((img) => img.storage_path)
  );

  const { error } = await supabase.from("products").delete().eq("id", productId);
  if (error) throw new Error(error.message);

  if (paths.length) await supabase.storage.from(PRODUCT_IMAGES_BUCKET).remove(paths);
  revalidateCatalog();
}
