"use client";

import React, { useState } from "react";
import { Plus, Minus } from "lucide-react";

interface AccordionItem {
  title: string;
  content: React.ReactNode;
}

export const Accordion: React.FC<{ items: AccordionItem[]; defaultOpen?: number }> = ({
  items,
  defaultOpen = 0,
}) => {
  const [openIndex, setOpenIndex] = useState<number | null>(defaultOpen);

  return (
    <div className="border-t-2 border-line">
      {items.map((item, i) => {
        const isOpen = openIndex === i;
        return (
          <div key={item.title} className="border-b-2 border-line">
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : i)}
              aria-expanded={isOpen}
              className="w-full flex items-center justify-between py-4 text-left"
            >
              <span className="font-sans font-semibold text-sm uppercase tracking-wide">
                {item.title}
              </span>
              {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            </button>
            {isOpen && (
              <div className="pb-4 font-sans text-sm text-ink-muted leading-relaxed">
                {item.content}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
