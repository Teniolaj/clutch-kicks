import { z } from "zod";
import { badges, silhouettes, type Silhouette } from "@/data/products";

// Shared by the product form (client-side checks) and saveProduct (server-side checks).

export const EU_SIZES = ["36", "37", "38", "39", "40", "41", "42", "43", "44", "45", "46", "47"];
export const DEFAULT_RUN = ["39", "40", "41", "42", "43", "44", "45", "46"];

const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export function slugify(text: string): string {
  return text
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const sizeSchema = z.object({
  eu: z.string().regex(/^[0-9]{2}(\.5)?$/, "Invalid size"),
  inStock: z.boolean(),
  lowStock: z.boolean(),
});

const imageSchema = z.object({
  id: z.uuid(),
  storagePath: z.string().min(1),
});

const variantSchema = z
  .object({
    id: z.uuid(),
    colorway: z.string().trim().min(1, "Enter the colour name").max(120, "Colour name is too long"),
    slug: z.string().regex(SLUG_RE, "Colour name needs at least one letter or number"),
    swatchHex: z.string().regex(/^#[0-9a-fA-F]{6}$/).nullable(),
    price: z.number({ error: "Enter a price" }).int().min(0, "Price can't be negative"),
    compareAtPrice: z.number({ error: "Enter a valid 'was' price" }).int().positive().nullable(),
    inStock: z.boolean(),
    isDefault: z.boolean(),
    images: z.array(imageSchema),
    sizes: z.array(sizeSchema).min(1, "Pick at least one size"),
  })
  .refine((v) => v.compareAtPrice === null || v.compareAtPrice > v.price, {
    message: "'Was' price must be higher than the price",
    path: ["compareAtPrice"],
  });

export const productSchema = z
  .object({
    id: z.uuid(),
    slug: z.string().regex(SLUG_RE, "URL name can only use lowercase letters, numbers and dashes"),
    brand: z.string().trim().min(1, "Enter the brand").max(80, "Brand is too long"),
    name: z.string().trim().min(1, "Enter the product name").max(120, "Product name is too long"),
    description: z.string().max(2000, "Description is too long"),
    silhouette: z.enum(silhouettes as [Silhouette, ...Silhouette[]], { error: "Pick a silhouette" }),
    badge: z.enum(badges as [string, ...string[]]).nullable(),
    isPublished: z.boolean(),
    variants: z.array(variantSchema).min(1, "Add at least one colour"),
  })
  .superRefine((p, ctx) => {
    const seen = new Set<string>();
    p.variants.forEach((v, i) => {
      // Uploads go to {productId}/{variantId}/…; anything else wasn't uploaded by
      // this form, and removing it on save could delete another product's photos.
      if (v.images.some((img) => !img.storagePath.startsWith(`${p.id}/${v.id}/`) || img.storagePath.includes(".."))) {
        ctx.addIssue({ code: "custom", message: "A photo is in the wrong place. Remove it and upload it again.", path: ["variants", i, "images"] });
      }
      if (seen.has(v.slug)) {
        ctx.addIssue({
          code: "custom",
          message: "Another colour already has this name",
          path: ["variants", i, "colorway"],
        });
      }
      seen.add(v.slug);
    });
    if (p.variants.filter((v) => v.isDefault).length !== 1) {
      ctx.addIssue({ code: "custom", message: "Pick one main colour", path: ["variants"] });
    }
    if (p.isPublished) {
      p.variants.forEach((v, i) => {
        if (v.images.length === 0) {
          ctx.addIssue({
            code: "custom",
            message: "Add at least one photo before publishing",
            path: ["variants", i, "images"],
          });
        }
      });
    }
  });

export type ProductInput = z.infer<typeof productSchema>;

// Errors keyed by the form field they belong to, so the form can highlight that
// field: "brand", "slug", ... for product fields, variantErrorKey(id, field) for
// a colour's fields, "variants" for the colour list as a whole, and FORM_ERROR
// for anything that isn't tied to a field (network, permissions, database).
export type FieldErrors = Record<string, string>;

export const FORM_ERROR = "form";

export function variantErrorKey(variantId: string, field: string): string {
  return `variant:${variantId}:${field}`;
}

export function fieldErrorsFromIssues(issues: z.core.$ZodIssue[], variantIds: string[]): FieldErrors {
  const errors: FieldErrors = {};
  for (const issue of issues) {
    const [first, index, field] = issue.path;
    let key: string;
    if (first === "variants" && typeof index === "number" && variantIds[index]) {
      // The colour's slug is derived from its name, so its errors belong on the name.
      key = variantErrorKey(variantIds[index], typeof field === "string" && field !== "slug" ? field : "colorway");
    } else if (typeof first === "string") {
      key = first;
    } else {
      key = FORM_ERROR;
    }
    // Keep the first message per field.
    errors[key] ??= issue.message;
  }
  return errors;
}

export type SaveResult = { ok: true; id: string } | { ok: false; errors: FieldErrors };
