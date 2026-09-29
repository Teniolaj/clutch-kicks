// Shapes of the shop catalogue as the storefront sees it. Kept free of server
// imports so client components can use them.
import type { Badge, ProductSize, Silhouette } from "@/data/products";

export interface CatalogVariant {
  id: string;
  slug: string;
  colorway: string;
  swatchHex: string | null;
  /** Price the shopper pays, after any live promotion. */
  price: number;
  /** Crossed-out price: the pre-promo price, or the 'was' price set in admin. */
  compareAtPrice: number | null;
  promotionName: string | null;
  /** False when the colour is switched off or every size is sold out. */
  inStock: boolean;
  images: string[];
  sizes: ProductSize[];
}

export interface CatalogProduct {
  id: string;
  slug: string;
  brand: string;
  name: string;
  description: string;
  silhouette: Silhouette;
  badge: Badge;
  createdAt: string;
  /** Sorted as in admin, main colour first. Always at least one. */
  variants: CatalogVariant[];
}

export function variantBySlug(product: CatalogProduct, slug: string | null | undefined): CatalogVariant {
  return product.variants.find((v) => v.slug === slug) ?? product.variants[0];
}

export function productHref(product: CatalogProduct, variant?: CatalogVariant): string {
  const base = `/products/${product.slug}/`;
  return variant && variant.id !== product.variants[0].id ? `${base}?color=${variant.slug}` : base;
}

export function percentOff(variant: CatalogVariant): number | null {
  if (!variant.compareAtPrice || variant.compareAtPrice <= variant.price) return null;
  return Math.round((1 - variant.price / variant.compareAtPrice) * 100);
}

export function isOnSale(product: CatalogProduct): boolean {
  return product.badge === "SALE" || product.variants.some((v) => percentOff(v) !== null);
}

export function isNewDrop(product: CatalogProduct): boolean {
  return product.badge === "NEW" || product.badge === "TRENDING";
}
