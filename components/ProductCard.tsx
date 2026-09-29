"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Heart } from "lucide-react";
import { formatNaira } from "@/data/products";
import { type CatalogProduct, percentOff, productHref } from "@/lib/catalog-types";
import { ColourSwatches } from "./ColourSwatches";
import { useCart } from "./cart/CartContext";

const badgeStyles: Record<string, string> = {
  NEW: "bg-ink text-ink-invert",
  "BACK IN STOCK": "bg-ink text-ink-invert",
  TRENDING: "bg-volt text-ink",
  SALE: "bg-volt text-ink",
  "FINAL PAIR": "bg-red text-ink-invert",
  "SOLD OUT": "bg-bg-invert text-ink-invert",
};

const MAX_SWATCHES = 5;

export const ProductCard: React.FC<{ product: CatalogProduct }> = ({ product }) => {
  const [variantId, setVariantId] = useState(product.variants[0].id);
  const variant = product.variants.find((v) => v.id === variantId) ?? product.variants[0];
  const firstAvailable = (v: typeof variant) => v.sizes.find((s) => !s.soldOut)?.eu ?? null;
  const [selectedSize, setSelectedSize] = useState<string | null>(firstAvailable(variant));
  const [wishlisted, setWishlisted] = useState(false);
  const { addItem } = useCart();

  const soldOut = !variant.inStock;
  const off = percentOff(variant);
  const badge = soldOut
    ? "SOLD OUT"
    : product.badge === "SALE" || (!product.badge && off)
      ? off
        ? `${off}% OFF`
        : "SALE"
      : product.badge;
  const badgeStyle = badgeStyles[soldOut ? "SOLD OUT" : product.badge ?? "SALE"];
  const href = productHref(product, variant);

  function selectVariant(id: string) {
    const next = product.variants.find((v) => v.id === id);
    if (!next) return;
    setVariantId(id);
    setSelectedSize(firstAvailable(next));
  }

  return (
    // h-full + the fixed-height rows below keep every card in a grid the same height.
    <div className="group relative flex flex-col h-full bg-bg-alt border-2 border-transparent transition-colors">
      {/* Green border-trace animation on hover */}
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 w-full h-full z-10"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <rect
          x="0.5"
          y="0.5"
          width="99"
          height="99"
          fill="none"
          stroke="#22c55e"
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
          pathLength={100}
          strokeDasharray={100}
          strokeDashoffset={100}
          className="opacity-0 [transition:stroke-dashoffset_0.7s_ease,opacity_0.2s_ease] group-hover:opacity-100 group-hover:[stroke-dashoffset:0]"
        />
      </svg>

      <Link href={href} className="relative block aspect-square overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={variant.images[0]}
          alt={`${product.brand} ${product.name} — ${variant.colorway}`}
          loading="lazy"
          className={`w-full h-full object-cover ${soldOut ? "opacity-60 grayscale-[40%]" : ""}`}
        />
        {badge && (
          <span
            className={`absolute top-3 left-3 px-2.5 py-1 text-[11px] font-mono font-bold uppercase tracking-wide ${badgeStyle}`}
          >
            {badge}
          </span>
        )}
      </Link>

      <div className="flex flex-col flex-1 gap-1 p-4">
        <span className="font-mono text-[11px] uppercase tracking-ultra-wide text-ink-muted truncate">
          {product.brand}
        </span>
        <Link href={href} title={product.name}>
          {/* Always two lines tall, long names are cut with "…" */}
          <h3 className="font-sans font-semibold text-base leading-tight line-clamp-2 min-h-[2.5rem] hover:underline underline-offset-2">
            {product.name}
          </h3>
        </Link>
        <p className="font-sans text-xs text-ink-muted truncate" title={variant.colorway}>
          {variant.colorway}
        </p>

        {/* Swatch row keeps its space even for single-colour products */}
        <div className="mt-2 h-6">
          {product.variants.length > 1 && (
            <ColourSwatches
              product={product}
              activeId={variant.id}
              onSelect={selectVariant}
              max={MAX_SWATCHES}
              size="sm"
              singleLine
            />
          )}
        </div>

        <div className="flex items-baseline gap-2 mt-1">
          <span className="font-sans font-semibold text-base text-red">
            {formatNaira(variant.price)}
          </span>
          {variant.compareAtPrice && variant.compareAtPrice > variant.price && (
            <span className="font-sans text-xs text-ink-muted line-through">
              {formatNaira(variant.compareAtPrice)}
            </span>
          )}
        </div>

        {/* Size strip: one line, swipe sideways if the sizes don't fit */}
        <div className="flex flex-nowrap gap-1.5 mt-3 overflow-x-auto no-scrollbar">
          {variant.sizes.map((s) => (
            <button
              key={s.eu}
              type="button"
              disabled={s.soldOut}
              onClick={() => setSelectedSize(s.eu)}
              aria-pressed={selectedSize === s.eu}
              className={`shrink-0 min-w-[30px] h-7 px-1.5 text-[11px] font-mono border transition-colors ${
                s.soldOut
                  ? "text-ink-muted border-line line-through cursor-not-allowed"
                  : selectedSize === s.eu
                  ? "bg-ink text-ink-invert border-ink"
                  : "border-line hover:border-line-strong"
              }`}
            >
              {s.eu}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 mt-auto pt-3">
          <button
            type="button"
            disabled={soldOut || !selectedSize}
            onClick={() => selectedSize && addItem(product, variant, selectedSize)}
            className="flex-1 h-11 bg-ink text-ink-invert border-2 border-ink font-sans text-xs font-bold uppercase tracking-wide hover:bg-transparent hover:text-ink transition-colors disabled:bg-bg-sunken disabled:border-line disabled:text-ink-muted disabled:cursor-not-allowed"
          >
            {soldOut ? "Sold Out" : `Add — ${formatNaira(variant.price)}`}
          </button>
          <button
            type="button"
            onClick={() => setWishlisted((w) => !w)}
            aria-label="Toggle wishlist"
            aria-pressed={wishlisted}
            className={`w-11 h-11 shrink-0 flex items-center justify-center border-2 transition-colors ${
              wishlisted ? "border-red text-red" : "border-line hover:border-line-strong"
            }`}
          >
            <Heart className="w-4 h-4" fill={wishlisted ? "currentColor" : "none"} />
          </button>
        </div>
      </div>
    </div>
  );
};
