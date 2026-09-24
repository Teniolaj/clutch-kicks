import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "./Button";
import { MarkerLabel } from "./marker/MarkerLabel";
import { products, formatNaira } from "@/data/products";

export const Hero: React.FC = () => {
  const featured = products.find((p) => p.id === "jordan5-tour-yellow") ?? products[0];

  return (
    <section className="relative w-full bg-bg-invert text-ink-invert overflow-hidden min-h-[min(88vh,720px)] flex items-center">
      {/* faint oversized outline type in the background */}
      <span
        aria-hidden="true"
        className="absolute -bottom-10 left-0 font-display text-[22vw] leading-none uppercase text-ink-invert opacity-[0.1] select-none whitespace-nowrap"
      >
        Clutch Kicks
      </span>

      <div className="relative max-w-[1440px] w-full mx-auto px-4 md:px-8 py-20 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left: copy */}
        <div className="lg:col-span-7 flex flex-col items-start max-w-[640px]">
          <MarkerLabel className="mb-5 -ml-2">New Drop</MarkerLabel>

          <h1 className="group font-display uppercase leading-[0.88] tracking-display text-[clamp(48px,7.5vw,104px)] cursor-default">
            <span className="block transition-transform duration-300 ease-out group-hover:-translate-y-1">
              Stepping
            </span>
            <span className="relative inline-block text-red transition-transform duration-300 ease-out group-hover:translate-x-2">
              Correct.
              <span
                aria-hidden="true"
                className="absolute left-0 -bottom-1 h-[0.08em] w-full bg-red origin-left scale-x-0 transition-transform duration-500 ease-out group-hover:scale-x-100"
              />
            </span>
          </h1>

          <p className="mt-6 font-sans text-base text-ink-invert/80 leading-relaxed max-w-md">
            Fresh kicks. Bold moves. Deadstock only, receipt in box — every
            pair verified before it ships.
          </p>

          <div className="mt-8">
            <Link href="/products">
              <Button variant="invert">
                Shop The Drop
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Right: product shot, oversized and allowed to bleed past the grid */}
        <div className="lg:col-span-5 relative flex items-center justify-center lg:justify-end lg:overflow-visible">
          <div className="relative w-full max-w-[440px] lg:max-w-none lg:w-[135%] animate-float">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={featured.image}
              alt={`${featured.brand} ${featured.name} — ${featured.colorway}`}
              className="w-full h-auto object-contain drop-shadow-[0_30px_40px_rgba(0,0,0,0.45)]"
            />

            {/* rotated sticker badge */}
            <div
              className="absolute bottom-2 right-2 sm:bottom-8 sm:right-4 bg-volt text-ink px-4 py-2 -rotate-3"
              style={{ boxShadow: "4px 4px 0 var(--ck-ink-invert)" }}
            >
              <span className="font-sans font-bold text-xs uppercase tracking-wide">
                Limited · {formatNaira(featured.price)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
