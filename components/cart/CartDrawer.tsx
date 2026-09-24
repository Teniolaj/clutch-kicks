"use client";

import React from "react";
import { X, Minus, Plus, MessageSquare } from "lucide-react";
import { useCart } from "./CartContext";
import { products, formatNaira, getProductIndex, getSizesFor } from "@/data/products";

const FREE_DELIVERY_THRESHOLD = 150000;
const DELIVERY_FEE = 5000;
const WHATSAPP_NUMBER = "2348000000000";

export const CartDrawer: React.FC = () => {
  const { lines, isOpen, closeCart, removeItem, updateQty } = useCart();

  const items = lines
    .map((line) => {
      const product = products.find((p) => p.id === line.productId);
      return product ? { line, product } : null;
    })
    .filter((x): x is { line: typeof lines[0]; product: (typeof products)[0] } => x !== null);

  const subtotal = items.reduce((sum, { line, product }) => sum + product.price * line.qty, 0);
  const delivery = subtotal === 0 || subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
  const total = subtotal + delivery;
  const progress = Math.min(1, subtotal / FREE_DELIVERY_THRESHOLD);

  const checkoutUrl = () => {
    const lineText = items
      .map(
        ({ line, product }) =>
          `• ${product.brand} ${product.name} (${product.colorway}) — EU ${line.size} x${line.qty} — ${formatNaira(product.price * line.qty)}`
      )
      .join("\n");
    const message = encodeURIComponent(
      `Hello Clutch Kicks! I'd like to order:\n\n${lineText}\n\nDelivery: ${delivery === 0 ? "Free" : formatNaira(delivery)}\nTotal: ${formatNaira(total)}\n\nPlease confirm availability and payment details.`
    );
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={closeCart}
        className={`fixed inset-0 bg-black/50 z-[90] transition-opacity duration-200 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Drawer */}
      <aside
        className={`fixed top-0 right-0 h-full w-full sm:w-[420px] bg-bg text-ink z-[100] shadow-lift transition-transform duration-300 flex flex-col ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        aria-hidden={!isOpen}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b-2 border-line">
          <h2 className="font-display uppercase text-lg">Your Bag ({items.length})</h2>
          <button
            type="button"
            onClick={closeCart}
            aria-label="Close cart"
            className="w-11 h-11 flex items-center justify-center border-2 border-transparent hover:border-line-strong transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 px-6 text-center">
            <p className="font-sans text-ink-muted">Your bag is empty.</p>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-5">
              {items.map(({ line, product }) => {
                const idx = getProductIndex(product.id);
                const sizeInfo = getSizesFor(idx).find((s) => s.eu === line.size);
                return (
                  <div key={`${product.id}-${line.size}`} className="flex gap-4 pb-5 border-b border-line">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={product.image}
                      alt={`${product.brand} ${product.name}`}
                      className="w-20 h-20 object-cover bg-bg-alt border border-line shrink-0"
                    />
                    <div className="flex-1 flex flex-col gap-1">
                      <span className="font-mono text-[11px] uppercase tracking-ultra-wide text-ink-muted">
                        {product.brand}
                      </span>
                      <span className="font-sans font-semibold text-sm leading-tight">
                        {product.name}
                      </span>
                      <span className="font-sans text-xs text-ink-muted">{product.colorway}</span>
                      <span className="font-mono text-[11px] uppercase text-ink-muted">
                        EU {line.size}
                        {sizeInfo?.lowStock && (
                          <span className="text-red ml-1">— low stock</span>
                        )}
                      </span>

                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center border-2 border-line">
                          <button
                            type="button"
                            onClick={() => updateQty(product.id, line.size, line.qty - 1)}
                            className="w-8 h-8 flex items-center justify-center hover:bg-bg-alt"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-8 text-center font-mono text-sm">{line.qty}</span>
                          <button
                            type="button"
                            onClick={() => updateQty(product.id, line.size, line.qty + 1)}
                            className="w-8 h-8 flex items-center justify-center hover:bg-bg-alt"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <span className="price font-sans font-semibold text-sm text-red">
                          {formatNaira(product.price * line.qty)}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(product.id, line.size)}
                      aria-label="Remove item"
                      className="self-start text-ink-muted hover:text-red transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="px-6 pt-4 pb-2 border-t-2 border-line">
              <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-wide text-ink-muted mb-1.5">
                <span>{delivery === 0 ? "Free delivery unlocked" : `Add ${formatNaira(FREE_DELIVERY_THRESHOLD - subtotal)} for free delivery`}</span>
              </div>
              <div className="h-2 bg-bg-alt border border-line">
                <div
                  className="h-full bg-volt transition-all duration-300"
                  style={{ width: `${progress * 100}%` }}
                />
              </div>
            </div>

            <div className="px-6 py-5 border-t-2 border-line flex flex-col gap-3">
              <div className="flex items-center justify-between font-sans text-sm">
                <span className="text-ink-muted">Subtotal</span>
                <span>{formatNaira(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between font-sans text-sm">
                <span className="text-ink-muted">Delivery</span>
                <span>{delivery === 0 ? "Free" : formatNaira(delivery)}</span>
              </div>
              <div className="flex items-center justify-between font-display text-lg pt-2 border-t border-line">
                <span>Total</span>
                <span>{formatNaira(total)}</span>
              </div>

              <a
                href={checkoutUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 w-full h-14 bg-ink text-ink-invert font-sans font-semibold text-sm uppercase tracking-wide flex items-center justify-center gap-2 border-2 border-ink hover:bg-transparent hover:text-ink transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                Checkout on WhatsApp
              </a>
            </div>
          </>
        )}
      </aside>
    </>
  );
};
