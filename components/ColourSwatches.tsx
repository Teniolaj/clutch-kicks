"use client";

import React from "react";
import Link from "next/link";
import { type CatalogProduct, productHref } from "@/lib/catalog-types";

// Colour picker for a product with several colourways. Uses the swatch colour
// set in admin, or a crop of the colour's first photo when none is set.
export const ColourSwatches: React.FC<{
  product: CatalogProduct;
  activeId: string;
  onSelect: (variantId: string) => void;
  size: "sm" | "lg";
  max?: number;
  /** Keep the swatches on one line (fixed height); any that don't fit scroll sideways */
  singleLine?: boolean;
  className?: string;
}> = ({ product, activeId, onSelect, size, max, singleLine = false, className = "" }) => {
  const shown = max ? product.variants.slice(0, max) : product.variants;
  const hidden = product.variants.length - shown.length;
  const box = size === "sm" ? "w-6 h-6" : "w-16 h-16";

  return (
    <div
      role="radiogroup"
      aria-label="Colour"
      className={`flex items-center gap-1.5 ${singleLine ? "flex-nowrap overflow-x-auto no-scrollbar" : "flex-wrap"} ${className}`}
    >
      {shown.map((v) => {
        const active = v.id === activeId;
        return (
          <button
            key={v.id}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={`${v.colorway}${v.inStock ? "" : " (sold out)"}`}
            title={v.colorway}
            onClick={() => onSelect(v.id)}
            className={`relative ${box} shrink-0 p-0.5 border-2 transition-colors ${
              active ? "border-ink" : "border-line hover:border-line-strong"
            }`}
          >
            {v.swatchHex && size === "sm" ? (
              <span className="block w-full h-full" style={{ backgroundColor: v.swatchHex }} />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={v.images[0]} alt="" loading="lazy" className="block w-full h-full object-cover" />
            )}
            {!v.inStock && (
              <span
                aria-hidden="true"
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(to top right, transparent calc(50% - 1px), var(--ck-line-strong) 50%, transparent calc(50% + 1px))",
                }}
              />
            )}
          </button>
        );
      })}
      {hidden > 0 && (
        <Link
          href={productHref(product)}
          className="font-mono text-[11px] text-ink-muted hover:text-ink px-1"
          aria-label={`${hidden} more colours`}
        >
          +{hidden}
        </Link>
      )}
    </div>
  );
};
