"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { Product } from "@/data/products";

export interface CartLine {
  productId: string;
  size: string;
  qty: number;
}

interface CartContextValue {
  lines: CartLine[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (product: Product, size: string) => void;
  removeItem: (productId: string, size: string) => void;
  updateQty: (productId: string, size: string, qty: number) => void;
  count: number;
}

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "ck_cart_lines";

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
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

  const addItem = useCallback((product: Product, size: string) => {
    setLines((prev) => {
      const existing = prev.find((l) => l.productId === product.id && l.size === size);
      if (existing) {
        return prev.map((l) =>
          l.productId === product.id && l.size === size ? { ...l, qty: l.qty + 1 } : l
        );
      }
      return [...prev, { productId: product.id, size, qty: 1 }];
    });
    setIsOpen(true);
  }, []);

  const removeItem = useCallback((productId: string, size: string) => {
    setLines((prev) => prev.filter((l) => !(l.productId === productId && l.size === size)));
  }, []);

  const updateQty = useCallback((productId: string, size: string, qty: number) => {
    setLines((prev) =>
      prev.map((l) =>
        l.productId === productId && l.size === size ? { ...l, qty: Math.max(1, qty) } : l
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
