"use client";

import React, { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { X } from "lucide-react";
import { TickerBar } from "@/components/TickerBar";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { products, silhouettes } from "@/data/products";

const PAGE_SIZE = 12;

function ProductsContent() {
  const searchParams = useSearchParams();
  const initialSilhouette = searchParams.get("silhouette");
  const initialFilter = searchParams.get("filter");

  const brands = useMemo(
    () => Array.from(new Set(products.map((p) => p.brand))).sort(),
    []
  );

  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedSilhouettes, setSelectedSilhouettes] = useState<string[]>(
    initialSilhouette ? [initialSilhouette] : []
  );
  const [saleOnly, setSaleOnly] = useState(initialFilter === "sale");
  const [newOnly, setNewOnly] = useState(initialFilter === "new");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const toggle = (list: string[], value: string, setList: (v: string[]) => void) => {
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
    setVisibleCount(PAGE_SIZE);
  };

  const filtered = products.filter((p) => {
    if (selectedBrands.length && !selectedBrands.includes(p.brand)) return false;
    if (selectedSilhouettes.length && !selectedSilhouettes.includes(p.silhouette)) return false;
    if (saleOnly && p.badge !== "SALE") return false;
    if (newOnly && p.badge !== "NEW" && p.badge !== "TRENDING") return false;
    return true;
  });

  const activeChips: { label: string; clear: () => void }[] = [
    ...selectedBrands.map((b) => ({ label: b, clear: () => toggle(selectedBrands, b, setSelectedBrands) })),
    ...selectedSilhouettes.map((s) => ({
      label: s,
      clear: () => toggle(selectedSilhouettes, s, setSelectedSilhouettes),
    })),
    ...(saleOnly ? [{ label: "Sale", clear: () => setSaleOnly(false) }] : []),
    ...(newOnly ? [{ label: "New", clear: () => setNewOnly(false) }] : []),
  ];

  const FilterRailContent = (
    <div className="flex flex-col gap-8">
      <div>
        <h4 className="font-sans text-xs font-bold uppercase tracking-ultra-wide mb-3">
          Quick Filters
        </h4>
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2 text-sm font-sans cursor-pointer">
            <input
              type="checkbox"
              checked={newOnly}
              onChange={() => {
                setNewOnly((v) => !v);
                setVisibleCount(PAGE_SIZE);
              }}
              className="accent-ink w-4 h-4"
            />
            New &amp; Trending
          </label>
          <label className="flex items-center gap-2 text-sm font-sans cursor-pointer">
            <input
              type="checkbox"
              checked={saleOnly}
              onChange={() => {
                setSaleOnly((v) => !v);
                setVisibleCount(PAGE_SIZE);
              }}
              className="accent-ink w-4 h-4"
            />
            On Sale
          </label>
        </div>
      </div>

      <div>
        <h4 className="font-sans text-xs font-bold uppercase tracking-ultra-wide mb-3">
          Silhouette
        </h4>
        <div className="flex flex-col gap-2">
          {silhouettes.map((s) => (
            <label key={s} className="flex items-center gap-2 text-sm font-sans cursor-pointer">
              <input
                type="checkbox"
                checked={selectedSilhouettes.includes(s)}
                onChange={() => toggle(selectedSilhouettes, s, setSelectedSilhouettes)}
                className="accent-ink w-4 h-4"
              />
              {s}
            </label>
          ))}
        </div>
      </div>

      <div>
        <h4 className="font-sans text-xs font-bold uppercase tracking-ultra-wide mb-3">
          Brand
        </h4>
        <div className="flex flex-col gap-2">
          {brands.map((b) => (
            <label key={b} className="flex items-center gap-2 text-sm font-sans cursor-pointer">
              <input
                type="checkbox"
                checked={selectedBrands.includes(b)}
                onChange={() => toggle(selectedBrands, b, setSelectedBrands)}
                className="accent-ink w-4 h-4"
              />
              {b}
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="relative min-h-screen bg-bg text-ink">
      <TickerBar />
      <Navbar />
      <main className="pt-[104px]">
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-10">
          <span className="font-mono text-xs uppercase tracking-ultra-wide text-ink-muted">
            {filtered.length} {filtered.length === 1 ? "Pair" : "Pairs"}
          </span>
          <h1 className="font-display uppercase text-[clamp(32px,5vw,48px)] mt-1">
            All Products
          </h1>

          {activeChips.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {activeChips.map((chip) => (
                <button
                  key={chip.label}
                  type="button"
                  onClick={chip.clear}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-ink text-ink-invert text-xs font-mono uppercase tracking-wide"
                >
                  {chip.label}
                  <X className="w-3 h-3" />
                </button>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={() => setMobileFiltersOpen(true)}
            className="lg:hidden mt-6 w-full h-11 border-2 border-line-strong font-sans text-sm font-semibold uppercase tracking-wide"
          >
            Filters
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-10 mt-8">
            {/* Desktop filter rail */}
            <aside className="hidden lg:block sticky top-[120px] self-start">
              {FilterRailContent}
            </aside>

            <div>
              {filtered.length === 0 ? (
                <div className="py-24 text-center font-sans text-ink-muted">
                  No pairs match those filters.
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                    {filtered.slice(0, visibleCount).map((p) => (
                      <ProductCard key={p.id} product={p} />
                    ))}
                  </div>
                  {visibleCount < filtered.length && (
                    <div className="flex justify-center mt-10">
                      <button
                        type="button"
                        onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                        className="h-12 px-8 border-2 border-line-strong font-sans text-sm font-semibold uppercase tracking-wide hover:bg-ink hover:text-ink-invert transition-colors"
                      >
                        Load More
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Mobile filter bottom sheet */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-[95] lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 max-h-[80vh] overflow-y-auto bg-bg p-6 shadow-lift">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display uppercase text-lg">Filters</h3>
              <button type="button" onClick={() => setMobileFiltersOpen(false)} aria-label="Close">
                <X className="w-5 h-5" />
              </button>
            </div>
            {FilterRailContent}
            <button
              type="button"
              onClick={() => setMobileFiltersOpen(false)}
              className="w-full h-12 mt-8 bg-ink text-ink-invert font-sans text-sm font-semibold uppercase tracking-wide"
            >
              Show {filtered.length} Results
            </button>
          </div>
        </div>
      )}

      <Footer />
      <CartDrawer />
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={null}>
      <ProductsContent />
    </Suspense>
  );
}
