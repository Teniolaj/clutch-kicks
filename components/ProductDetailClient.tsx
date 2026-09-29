"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
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
import { ColourSwatches } from "./ColourSwatches";
import { formatNaira } from "@/data/products";
import { type CatalogProduct, type CatalogVariant, productHref, variantBySlug } from "@/lib/catalog-types";
import { CONTACT_INFO } from "@/data/contact";

const firstAvailable = (v: CatalogVariant) => v.sizes.find((s) => !s.soldOut)?.eu ?? null;

interface DetailProps {
  product: CatalogProduct;
  completeTheFit: CatalogProduct[];
  alsoLike: CatalogProduct[];
}

// Reads ?color= so a link to a specific colour opens on it. The page wraps this in
// Suspense with <ProductDetailClient colorSlug={null}> as the fallback, so the
// server still renders the full page (on the main colour).
export const ProductDetailWithColor: React.FC<DetailProps> = (props) => {
  const searchParams = useSearchParams();
  return <ProductDetailClient {...props} colorSlug={searchParams.get("color")} />;
};

export const ProductDetailClient: React.FC<DetailProps & { colorSlug: string | null }> = ({
  product,
  completeTheFit,
  alsoLike,
  colorSlug,
}) => {
  const router = useRouter();
  const [variantId, setVariantId] = useState(() => variantBySlug(product, colorSlug).id);
  const variant = product.variants.find((v) => v.id === variantId) ?? product.variants[0];
  const [imageIndex, setImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(firstAvailable(variant));
  const { addItem } = useCart();

  // Follow ?color= changes made from outside the swatches (e.g. a bag link to another colour).
  const colorVariantId = variantBySlug(product, colorSlug).id;
  useEffect(() => {
    const next = product.variants.find((v) => v.id === colorVariantId);
    if (!next) return;
    setVariantId(next.id);
    setImageIndex(0);
    setSelectedSize(firstAvailable(next));
  }, [product, colorVariantId]);

  const soldOut = !variant.inStock;
  const image = variant.images[imageIndex] ?? variant.images[0];

  function selectVariant(id: string) {
    const next = product.variants.find((v) => v.id === id);
    if (!next) return;
    setVariantId(id);
    setImageIndex(0);
    setSelectedSize(firstAvailable(next));
    router.replace(productHref(product, next), { scroll: false });
  }

  const whatsappUrl = `https://wa.me/${CONTACT_INFO.whatsappNumber}?text=${encodeURIComponent(
    `Hello Clutch Kicks! I'd like to order the ${product.brand} ${product.name} (${variant.colorway})${
      selectedSize ? ` in EU ${selectedSize}` : ""
    }. Please confirm availability.`
  )}`;

  const handleAddToCart = () => {
    if (soldOut) return;
    if (!selectedSize) {
      const grid = document.getElementById("size-grid");
      grid?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    addItem(product, variant, selectedSize);
  };

  const addLabel = soldOut ? "Sold Out" : `Add To Cart — ${formatNaira(variant.price)}`;

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
            <div className="relative aspect-square bg-bg-alt border border-line overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image}
                alt={`${product.brand} ${product.name} — ${variant.colorway}`}
                className={`w-full h-full object-cover ${soldOut ? "opacity-60 grayscale-[40%]" : ""}`}
              />
              {soldOut && (
                <span className="absolute top-3 left-3 px-2.5 py-1 bg-bg-invert text-ink-invert text-[11px] font-mono font-bold uppercase tracking-wide">
                  Sold Out
                </span>
              )}
            </div>
            {variant.images.length > 1 && (
              <div className="grid grid-cols-5 gap-2 mt-2">
                {variant.images.map((src, i) => (
                  <button
                    key={src}
                    type="button"
                    onClick={() => setImageIndex(i)}
                    aria-label={`Photo ${i + 1}`}
                    aria-pressed={i === imageIndex}
                    className={`aspect-square bg-bg-alt border-2 overflow-hidden ${
                      i === imageIndex ? "border-ink" : "border-line hover:border-line-strong"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt="" loading="lazy" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col pb-10">
            <span className="font-mono text-xs uppercase tracking-ultra-wide text-ink-muted">
              {product.brand}
            </span>
            <h1 className="font-display uppercase text-[clamp(28px,4vw,44px)] leading-[0.95] mt-1">
              {product.name}
            </h1>
            <p className="font-sans text-sm text-ink-muted mt-2">{variant.colorway}</p>

            <div className="flex items-baseline gap-3 mt-4">
              <span className="font-sans font-semibold text-2xl text-red">
                {formatNaira(variant.price)}
              </span>
              {variant.compareAtPrice && variant.compareAtPrice > variant.price && (
                <span className="font-sans text-base text-ink-muted line-through">
                  {formatNaira(variant.compareAtPrice)}
                </span>
              )}
            </div>
            {variant.promotionName && (
              <p className="font-mono text-[11px] uppercase tracking-wide text-red mt-1">{variant.promotionName}</p>
            )}

            {product.variants.length > 1 && (
              <div className="mt-6">
                <span className="font-sans text-xs font-bold uppercase tracking-wide">
                  Colour: <span className="font-normal normal-case text-ink-muted">{variant.colorway}</span>
                </span>
                <ColourSwatches
                  product={product}
                  activeId={variant.id}
                  onSelect={selectVariant}
                  size="lg"
                  className="mt-3"
                />
              </div>
            )}

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
              <SizeGrid sizes={variant.sizes} selected={selectedSize} onSelect={setSelectedSize} />
              {soldOut ? (
                <p className="font-sans text-xs text-red mt-2">This colour is sold out.</p>
              ) : (
                !selectedSize && <p className="font-sans text-xs text-red mt-2">Select a size to continue.</p>
              )}
            </div>

            {/* Desktop actions */}
            <div className="hidden lg:flex flex-col gap-3 mt-8">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={soldOut}
                className="w-full h-14 bg-ink text-ink-invert border-2 border-ink font-sans font-semibold text-sm uppercase tracking-wide hover:bg-transparent hover:text-ink transition-colors disabled:bg-bg-sunken disabled:border-line disabled:text-ink-muted disabled:cursor-not-allowed"
              >
                {addLabel}
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
        {completeTheFit.length > 0 && (
          <section className="max-w-[1440px] mx-auto px-4 md:px-8 py-16 md:py-24">
            <SectionHeader label="Pair It" title="Complete The Fit" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {completeTheFit.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}

        {/* You Might Also Like */}
        {alsoLike.length > 0 && (
          <section className="max-w-[1440px] mx-auto px-4 md:px-8 pb-16 md:pb-24">
            <SectionHeader label="More Like This" title="You Might Also Like" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {alsoLike.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Mobile sticky buy bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-bg border-t-2 border-line p-3 shadow-lift">
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={soldOut}
          className="w-full h-14 bg-ink text-ink-invert font-sans font-semibold text-sm uppercase tracking-wide disabled:bg-bg-sunken disabled:text-ink-muted"
        >
          {addLabel}
        </button>
      </div>

      <Footer />
      <Drawer />
    </div>
  );
};
