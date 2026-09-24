import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { MarkerLabel } from "./marker/MarkerLabel";

interface SectionHeaderProps {
  label?: string;
  title: string;
  viewAllHref?: string;
  dark?: boolean;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  label,
  title,
  viewAllHref,
  dark = false,
}) => {
  return (
    <div className="flex items-end justify-between gap-6 flex-wrap mb-10">
      <div>
        {label && <MarkerLabel className="mb-2 -ml-2">{label}</MarkerLabel>}
        <h2
          className={`font-display uppercase text-[clamp(32px,5vw,48px)] leading-[0.95] tracking-display ${
            dark ? "text-ink-invert" : "text-ink"
          }`}
        >
          {title}
        </h2>
      </div>
      {viewAllHref && (
        <Link
          href={viewAllHref}
          className={`group inline-flex items-center gap-2 font-sans text-sm font-semibold uppercase tracking-wide border-2 px-5 py-2.5 transition-colors ${
            dark
              ? "border-ink-invert/30 text-ink-invert hover:bg-ink-invert hover:text-ink"
              : "border-line-strong text-ink hover:bg-ink hover:text-ink-invert"
          }`}
        >
          View All
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </Link>
      )}
    </div>
  );
};
