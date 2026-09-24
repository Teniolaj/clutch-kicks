import React from "react";
import Link from "next/link";
import { products, silhouettes } from "@/data/products";
import { SectionHeader } from "./SectionHeader";

export const SilhouetteGrid: React.FC = () => {
  return (
    <section className="max-w-[1440px] mx-auto px-4 md:px-8 py-16 md:py-24">
      <SectionHeader label="Browse" title="Shop By Silhouette" />
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {silhouettes.map((sil) => {
          const rep = products.find((p) => p.silhouette === sil) ?? products[0];
          return (
            <Link
              key={sil}
              href={`/products?silhouette=${encodeURIComponent(sil)}`}
              className="group relative aspect-square overflow-hidden border-2 border-transparent hover:border-line-strong transition-colors"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={rep.image}
                alt={sil}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/35 group-hover:bg-black/45 transition-colors" />
              <span className="absolute bottom-4 left-4 font-display uppercase text-white text-xl sm:text-2xl">
                {sil}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
};
