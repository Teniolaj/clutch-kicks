import React from "react";

const ITEMS = [
  "FREE DELIVERY OVER ₦150,000",
  "LAGOS SAME-DAY",
  "DEADSTOCK ONLY, RECEIPT IN BOX",
];

interface TickerBarProps {
  variant?: "ink" | "volt";
}

export const TickerBar: React.FC<TickerBarProps> = ({ variant = "ink" }) => {
  const text = ITEMS.join("   ·   ");
  const isVolt = variant === "volt";

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 w-full h-10 overflow-hidden flex items-center ${
        isVolt ? "bg-volt text-ink" : "bg-ink text-ink-invert"
      }`}
    >
      {/* sr-only static equivalent */}
      <span className="sr-only">{text}</span>

      <div aria-hidden="true" className="flex whitespace-nowrap animate-ticker motion-reduce:animate-none">
        {[0, 1].map((rep) => (
          <div key={rep} className="flex shrink-0">
            {ITEMS.map((item, i) => (
              <span
                key={`${rep}-${i}`}
                className="font-mono text-[13px] font-bold uppercase tracking-ultra-wide px-6"
              >
                {item}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
