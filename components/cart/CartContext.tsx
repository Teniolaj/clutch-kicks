"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { CatalogProduct, CatalogVariant } from "@/lib/catalog-types";

// What the bag needs to show a line without loading the catalogue. Prices are
// re-checked against the database at checkout.
export interface CartSnapshot {
  productSlug: string;
  variantSlug: string;
  brand: string;
  name: string;
  colorway: string;
  image: string;
  price: number;
  lowStock: boolean;
}

export interface CartLine {
  variantId: string;
  size: string;
  qty: number;
  snapshot: CartSnapshot;
}

interface CartContextValue {
  lines: CartLine[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (product: CatalogProduct, variant: CatalogVariant, size: string) => void;
  removeItem: (variantId: string, size: string) => void;
  updateQty: (variantId: string, size: string, qty: number) => void;
  count: number;
}

const CartContext = createContext<CartContextValue | null>(null);

// v2: lines are colour variants from the database. Older bags held products from
// the static catalogue and are dropped.
const STORAGE_KEY = "ck_cart_v2";

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      localStorage.removeItem("ck_cart_lines");
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setLines(JSON.parse(raw));
    } catch {
      // ignore
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      // ignore
    }
  }, [lines, hydrated]);

  const addItem = useCallback((product: CatalogProduct, variant: CatalogVariant, size: string) => {
    const snapshot: CartSnapshot = {
      productSlug: product.slug,
      variantSlug: variant.slug,
      brand: product.brand,
      name: product.name,
      colorway: variant.colorway,
      image: variant.images[0],
      price: variant.price,
      lowStock: variant.sizes.find((s) => s.eu === size)?.lowStock ?? false,
    };
    setLines((prev) => {
      const existing = prev.find((l) => l.variantId === variant.id && l.size === size);
      if (existing) {
        return prev.map((l) =>
          l.variantId === variant.id && l.size === size ? { ...l, qty: l.qty + 1, snapshot } : l
        );
      }
      return [...prev, { variantId: variant.id, size, qty: 1, snapshot }];
    });
    setIsOpen(true);
  }, []);

  const removeItem = useCallback((variantId: string, size: string) => {
    setLines((prev) => prev.filter((l) => !(l.variantId === variantId && l.size === size)));
  }, []);

  const updateQty = useCallback((variantId: string, size: string, qty: number) => {
    setLines((prev) =>
      prev.map((l) =>
        l.variantId === variantId && l.size === size ? { ...l, qty: Math.max(1, qty) } : l
      )
    );
  }, []);

  const count = lines.reduce((sum, l) => sum + l.qty, 0);

  return (
    <CartContext.Provider
      value={{
        lines,
        isOpen,
        openCart: () => setIsOpen(true),
        closeCart: () => setIsOpen(false),
        addItem,
        removeItem,
        updateQty,
        count,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
