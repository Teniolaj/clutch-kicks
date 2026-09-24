"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ChevronRight, MessageSquare } from "lucide-react";
import { TickerBar } from "./TickerBar";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { SizeGrid } from "./SizeGrid";
import { Accordion } from "./Accordion";
import { ProductCard } from "./ProductCard";
import { SectionHeader } from "./SectionHeader";
import { useCart } from "./cart/CartContext";
import { CartDrawer as Drawer } from "./cart/CartDrawer";
import { Product, products, formatNaira, getProductIndex, getSizesFor } from "@/data/products";

export const ProductDetailClient: React.FC<{ product: Product }> = ({ product }) => {
  const idx = getProductIndex(product.id);
  const sizes = getSizesFor(idx);
  const firstAvailable = sizes.find((s) => !s.soldOut)?.eu ?? null;
  const [selectedSize, setSelectedSize] = useState<string | null>(firstAvailable);
  const { addItem, openCart } = useCart();

  const whatsappUrl = `https://wa.me/2348000000000?text=${encodeURIComponent(
    `Hello Clutch Kicks! I'd like to order the ${product.brand} ${product.name} (${product.colorway})${
      selectedSize ? ` in EU ${selectedSize}` : ""
    }. Please confirm availability.`
  )}`;

  const completeTheFit = products.filter((p) => p.id !== product.id && p.silhouette !== product.silhouette).slice(0, 4);
  const alsoLike = products.filter((p) => p.id !== product.id && p.brand === product.brand).slice(0, 4);
  const alsoLikeFallback = alsoLike.length > 0 ? alsoLike : products.filter((p) => p.id !== product.id).slice(0, 4);

  const handleAddToCart = () => {
    if (!selectedSize) {
      const grid = document.getElementById("size-grid");
      grid?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    addItem(product, selectedSize);
  };

  return (
    <div className="relative min-h-screen bg-bg text-ink">
      <TickerBar />
      <Navbar />
      <main className="pt-[104px] pb-24 lg:pb-0">
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-6">
          <nav className="flex items-center gap-1.5 font-mono text-xs uppercase tracking-wide text-ink-muted">
            <Link href="/" className="hover:text-ink">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/products" className="hover:text-ink">Shop</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-ink">{product.name}</span>
          </nav>
        </div>

        <div className="max-w-[1440px] mx-auto px-4 md:px-8 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          {/* Gallery */}
          <div className="lg:sticky lg:top-[120px] lg:self-start">
            <div className="aspect-square bg-bg-alt border border-line overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={product.image}
                alt={`${product.brand} ${product.name} — ${product.colorway}`}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Info */}
          <div className="flex flex-col pb-10">
            <span className="font-mono text-xs uppercase tracking-ultra-wide text-ink-muted">
              {product.brand}
            </span>
            <h1 className="font-display uppercase text-[clamp(28px,4vw,44px)] leading-[0.95] mt-1">
              {product.name}
            </h1>
            <p className="font-sans text-sm text-ink-muted mt-2">{product.colorway}</p>

            <div className="flex items-baseline gap-3 mt-4">
              <span className="font-sans font-semibold text-2xl text-red">
                {formatNaira(product.price)}
              </span>
              {product.compareAtPrice && (
                <span className="font-sans text-base text-ink-muted line-through">
                  {formatNaira(product.compareAtPrice)}
                </span>
              )}
            </div>

            <p className="font-sans text-sm text-ink-muted leading-relaxed mt-4 max-w-md">
              {product.description}
            </p>

            <div id="size-grid" className="mt-8">
              <div className="flex items-center justify-between mb-3">
                <span className="font-sans text-xs font-bold uppercase tracking-wide">
                  Select Size
                </span>
                <button type="button" className="font-sans text-xs underline underline-offset-4 text-ink-muted">
                  Size Guide
                </button>
              </div>
              <SizeGrid sizes={sizes} selected={selectedSize} onSelect={setSelectedSize} />
              {!selectedSize && (
                <p className="font-sans text-xs text-red mt-2">Select a size to continue.</p>
              )}
            </div>

            {/* Desktop actions */}
            <div className="hidden lg:flex flex-col gap-3 mt-8">
              <button
                type="button"
                onClick={handleAddToCart}
                className="w-full h-14 bg-ink text-ink-invert border-2 border-ink font-sans font-semibold text-sm uppercase tracking-wide hover:bg-transparent hover:text-ink transition-colors"
              >
                Add To Cart — {formatNaira(product.price)}
              </button>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full h-14 flex items-center justify-center gap-2 border-2 border-line-strong font-sans font-semibold text-sm uppercase tracking-wide hover:bg-ink hover:text-ink-invert transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                Order On WhatsApp
              </a>
            </div>

            <p className="font-mono text-[11px] uppercase tracking-wide text-ink-muted mt-4">
              Deadstock. Receipt in box. Lagos same-day delivery.
            </p>

            <div className="mt-10">
              <Accordion
                defaultOpen={0}
                items={[
                  {
                    title: "Details & Materials",
                    content: (
                      <p>
                        {product.description} Silhouette: {product.silhouette}. Every pair is
                        inspected and verified before it ships, double-boxed for transit.
                      </p>
                    ),
                  },
                  {
                    title: "Sizing & Fit",
                    content: <p>True to size for most feet. Half sizes not currently stocked — size up if you&apos;re between sizes.</p>,
                  },
                  {
                    title: "Delivery & Returns",
                    content: <p>Same-day delivery in Lagos, 2–3 days nationwide. Free exchange within 14 days, unworn, original box.</p>,
                  },
                ]}
              />
            </div>
          </div>
        </div>

        {/* Complete the Fit */}
        <section className="max-w-[1440px] mx-auto px-4 md:px-8 py-16 md:py-24">
          <SectionHeader label="Pair It" title="Complete The Fit" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {completeTheFit.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>

        {/* You Might Also Like */}
        <section className="max-w-[1440px] mx-auto px-4 md:px-8 pb-16 md:pb-24">
          <SectionHeader label="More Like This" title="You Might Also Like" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {alsoLikeFallback.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      </main>

      {/* Mobile sticky buy bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-bg border-t-2 border-line p-3 shadow-lift">
        <button
          type="button"
          onClick={handleAddToCart}
          className="w-full h-14 bg-ink text-ink-invert font-sans font-semibold text-sm uppercase tracking-wide"
        >
          Add To Cart — {formatNaira(product.price)}
        </button>
      </div>

      <Footer />
      <Drawer />
    </div>
  );
};
