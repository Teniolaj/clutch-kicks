"use client";

import React from "react";
import { ProductSize } from "@/data/products";

interface SizeGridProps {
  sizes: ProductSize[];
  selected: string | null;
  onSelect: (eu: string) => void;
}

export const SizeGrid: React.FC<SizeGridProps> = ({ sizes, selected, onSelect }) => {
  return (
    <div
      role="radiogroup"
      aria-label="Select size"
      className="grid grid-cols-4 sm:grid-cols-6 gap-2"
    >
      {sizes.map((s) => {
        const isSelected = selected === s.eu;
        return (
          <button
            key={s.eu}
            type="button"
            role="radio"
            aria-checked={isSelected}
            disabled={s.soldOut}
            onClick={() => onSelect(s.eu)}
            className={`relative min-h-[44px] flex items-center justify-center font-mono text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus ${
              s.soldOut
                ? "border border-line text-ink-muted cursor-not-allowed"
                : isSelected
                ? "bg-ink text-ink-invert border-2 border-ink"
                : "border border-line hover:border-2 hover:border-line-strong"
            }`}
          >
            EU {s.eu}
            {s.soldOut && (
              <span
                aria-hidden="true"
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(to top right, transparent calc(50% - 1px), var(--ck-line-strong) 50%, transparent calc(50% + 1px))",
                }}
              />
            )}
            {!s.soldOut && s.lowStock && (
              <span
                aria-hidden="true"
                className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-red"
              />
            )}
          </button>
        );
      })}
    </div>
  );
};
