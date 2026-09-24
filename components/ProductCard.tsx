"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Heart } from "lucide-react";
import { Product, formatNaira, getProductIndex, getSizesFor } from "@/data/products";
import { useCart } from "./cart/CartContext";

const badgeStyles: Record<string, string> = {
  NEW: "bg-ink text-ink-invert",
  "BACK IN STOCK": "bg-ink text-ink-invert",
  TRENDING: "bg-volt text-ink",
  SALE: "bg-volt text-ink",
  "FINAL PAIR": "bg-red text-ink-invert",
};

export const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const idx = getProductIndex(product.id);
  const sizes = getSizesFor(idx);
  const firstAvailable = sizes.find((s) => !s.soldOut)?.eu ?? sizes[0].eu;
  const [selectedSize, setSelectedSize] = useState(firstAvailable);
  const [wishlisted, setWishlisted] = useState(false);
  const { addItem } = useCart();

  const percentOff = product.compareAtPrice
    ? Math.round((1 - product.price / product.compareAtPrice) * 100)
    : null;

  return (
    <div className="group relative flex flex-col bg-bg-alt border-2 border-transparent transition-colors">
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

      <Link href={`/products/${product.id}`} className="relative block aspect-square overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.image}
          alt={`${product.brand} ${product.name} — ${product.colorway}`}
          loading="lazy"
          className="w-full h-full object-cover"
        />
        {product.badge && (
          <span
            className={`absolute top-3 left-3 px-2.5 py-1 text-[11px] font-mono font-bold uppercase tracking-wide ${badgeStyles[product.badge]}`}
          >
            {product.badge === "SALE" && percentOff ? `${percentOff}% OFF` : product.badge}
          </span>
        )}
      </Link>

      <div className="flex flex-col gap-1 p-4">
        <span className="font-mono text-[11px] uppercase tracking-ultra-wide text-ink-muted">
          {product.brand}
        </span>
        <Link href={`/products/${product.id}`}>
          <h3 className="font-sans font-semibold text-base leading-tight hover:underline underline-offset-2">
            {product.name}
          </h3>
        </Link>
        <p className="font-sans text-xs text-ink-muted">{product.colorway}</p>

        <div className="flex items-baseline gap-2 mt-1">
          <span className="font-sans font-semibold text-base text-red">
            {formatNaira(product.price)}
          </span>
          {product.compareAtPrice && (
            <span className="font-sans text-xs text-ink-muted line-through">
              {formatNaira(product.compareAtPrice)}
            </span>
          )}
        </div>

        {/* Size strip */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {sizes.map((s) => (
            <button
              key={s.eu}
              type="button"
              disabled={s.soldOut}
              onClick={() => setSelectedSize(s.eu)}
              aria-pressed={selectedSize === s.eu}
              className={`min-w-[30px] h-7 px-1.5 text-[11px] font-mono border transition-colors ${
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

        <div className="flex items-center gap-2 mt-3">
          <button
            type="button"
            onClick={() => addItem(product, selectedSize)}
            className="flex-1 h-11 bg-ink text-ink-invert border-2 border-ink font-sans text-xs font-bold uppercase tracking-wide hover:bg-transparent hover:text-ink transition-colors"
          >
            Add — {formatNaira(product.price)}
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
