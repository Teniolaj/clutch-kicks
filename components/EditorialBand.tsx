import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "./Button";
import { MarkerUnderline } from "./marker/MarkerUnderline";

interface EditorialBandProps {
  image: string;
  eyebrow: string;
  lines: string[]; // last line rendered in volt
  href: string;
  ctaLabel: string;
  cardClassName?: string;
}

export const EditorialBand: React.FC<EditorialBandProps> = ({
  image,
  eyebrow,
  lines,
  href,
  ctaLabel,
  cardClassName,
}) => {
  return (
    <section className="relative w-full min-h-[480px] bg-bg-invert text-ink-invert overflow-hidden flex items-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={image}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover opacity-45"
      />

      <div className="relative max-w-[1440px] w-full mx-auto px-4 md:px-8 py-16">
        <div className={`max-w-xl bg-bg-invert p-8 overflow-hidden ${cardClassName ?? ""}`}>
          <span className="font-mono text-xs uppercase tracking-ultra-wide text-volt">
            {eyebrow}
          </span>
          <h2 className="mt-3 font-display uppercase text-[clamp(24px,3.5vw,40px)] leading-[0.95]">
            {lines.slice(0, -1).map((line, i) => (
              <span key={i} className="block">
                {line}
              </span>
            ))}
            <span className="relative inline-block text-volt">
              {lines[lines.length - 1]}
              <MarkerUnderline
                color="volt"
                className="absolute left-0 -bottom-2 w-full h-3 -rotate-1"
              />
            </span>
          </h2>
          <Link href={href} className="inline-block mt-6">
            <Button variant="invert">
              {ctaLabel}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};
