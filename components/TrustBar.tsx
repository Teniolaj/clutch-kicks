import React from "react";
import { ShieldCheck, Truck, RotateCcw, Headset } from "lucide-react";

const ITEMS = [
  { icon: ShieldCheck, title: "100% Authentic", sub: "Every pair verified" },
  { icon: Truck, title: "Fast Shipping", sub: "Lagos same-day" },
  { icon: RotateCcw, title: "Easy Returns", sub: "14-day policy" },
  { icon: Headset, title: "Always Here", sub: "We got your back" },
];

export const TrustBar: React.FC = () => {
  return (
    <section className="w-full bg-bg-sunken">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 grid grid-cols-2 md:grid-cols-4 divide-x divide-line min-h-[88px]">
        {ITEMS.map(({ icon: Icon, title, sub }, i) => (
          <div
            key={title}
            className={`flex items-center gap-3 py-5 px-4 ${i === 0 ? "" : ""}`}
          >
            <Icon className="w-6 h-6 text-ink shrink-0" strokeWidth={1.5} />
            <div className="flex flex-col leading-tight">
              <span className="font-sans text-xs font-semibold uppercase tracking-wide">
                {title}
              </span>
              <span className="font-sans text-xs text-ink-muted">{sub}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
