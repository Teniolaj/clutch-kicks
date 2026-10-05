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
import { getCatalog } from "@/lib/catalog";
import { type CatalogProduct, isNewDrop } from "@/lib/catalog-types";

// Cached and refreshed whenever a product is saved in admin.
export const revalidate = 300;

const SECTION_SIZE = 8;

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

const EmptySection = () => (
  <p className="py-16 text-center font-sans text-ink-muted">New pairs are landing soon. Check back shortly.</p>
);

const ProductGrid = ({ items }: { items: CatalogProduct[] }) => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
    {items.map((p, i) => (
      <Reveal key={p.id} delay={(i % 4) * 0.08} className="h-full">
        <ProductCard product={p} />
      </Reveal>
    ))}
  </div>
);

export default async function Home() {
  // The catalogue comes back newest first.
  const catalog = await getCatalog();

  // New Drops: NEW / TRENDING badges first, topped up with the latest uploads.
  const newDrops = [...catalog.filter(isNewDrop), ...catalog.filter((p) => !isNewDrop(p))].slice(0, SECTION_SIZE);
  // Featured: the next products not already in New Drops, newest first. If that
  // doesn't fill the section, top it up with random picks from New Drops. The
  // picks change each time the page is rebuilt (every few minutes or on save).
  const rest = catalog.filter((p) => !newDrops.includes(p)).slice(0, SECTION_SIZE);
  const featured = [...rest, ...shuffle(newDrops)].slice(0, SECTION_SIZE);

  // Editorial band photos are brand imagery, not products, so they stay static.
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
          {featured.length > 0 ? <ProductGrid items={featured} /> : <EmptySection />}
        </section>

        <Reveal direction="none">
          <EditorialBand
            image={editorialProduct.image}
            eyebrow="The Culture"
            lines={["Don't follow the trend.", "Set it."]}
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
          {newDrops.length > 0 ? <ProductGrid items={newDrops} /> : <EmptySection />}
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
