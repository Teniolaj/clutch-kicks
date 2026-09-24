import React from "react";
import { TickerBar } from "@/components/TickerBar";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { TrustBar } from "@/components/TrustBar";
import { SectionHeader } from "@/components/SectionHeader";
import { ProductCard } from "@/components/ProductCard";
import { EditorialBand } from "@/components/EditorialBand";
import { SilhouetteGrid } from "@/components/SilhouetteGrid";
import { NewsletterBand } from "@/components/NewsletterBand";
import { Footer } from "@/components/Footer";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { Reveal } from "@/components/Reveal";
import { products } from "@/data/products";

export default function Home() {
  const featured = products.slice(0, 8);
  const newDrops = products.filter((p) => p.badge === "NEW" || p.badge === "TRENDING").slice(0, 8);
  const editorialProduct = products.find((p) => p.id === "jordan5-belair") ?? products[0];
  const editorialProduct2 = products.find((p) => p.id === "nb-9060-sage") ?? products[1];

  return (
    <div className="relative min-h-screen bg-bg text-ink">
      <TickerBar />
      <Navbar />
      <main className="pt-[104px]">
        <Hero />
        <Reveal>
          <TrustBar />
        </Reveal>

        <section className="max-w-[1440px] mx-auto px-4 md:px-8 py-16 md:py-24">
          <Reveal>
            <SectionHeader label="Our Picks" title="Featured Kicks" viewAllHref="/products" />
          </Reveal>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {featured.map((p, i) => (
              <Reveal key={p.id} delay={(i % 4) * 0.08}>
                <ProductCard product={p} />
              </Reveal>
            ))}
          </div>
        </section>

        <Reveal direction="none">
          <EditorialBand
            image={editorialProduct.image}
            eyebrow="The Culture"
            lines={["Don't follow", "the trend.", "Set it."]}
            href="/products"
            ctaLabel="Shop Now"
          />
        </Reveal>

        <Reveal>
          <SilhouetteGrid />
        </Reveal>

        <section className="max-w-[1440px] mx-auto px-4 md:px-8 py-16 md:py-24">
          <Reveal>
            <SectionHeader label="Just In" title="New Drops" viewAllHref="/products?filter=new" />
          </Reveal>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {newDrops.map((p, i) => (
              <Reveal key={p.id} delay={(i % 4) * 0.08}>
                <ProductCard product={p} />
              </Reveal>
            ))}
          </div>
        </section>

        <Reveal direction="none">
          <EditorialBand
            image={editorialProduct2.image}
            eyebrow="Restocked"
            lines={["Quiet flex.", "Loud", "quality."]}
            href="/products"
            ctaLabel="Explore"
          />
        </Reveal>

        <Reveal>
          <NewsletterBand />
        </Reveal>
      </main>
      <Footer />
      <CartDrawer />
    </div>
  );
}
