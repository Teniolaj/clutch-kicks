export type Silhouette = "Low-Top" | "High-Top" | "Runner" | "Slide" | "Platform" | "Slip-On";
export type Badge =
  | "NEW"
  | "BACK IN STOCK"
  | "TRENDING"
  | "FINAL PAIR"
  | "SALE"
  | null;

export interface ProductSize {
  eu: string;
  soldOut?: boolean;
  lowStock?: boolean;
}

export interface Product {
  id: string;
  brand: string;
  name: string;
  colorway: string;
  price: number;
  compareAtPrice?: number;
  silhouette: Silhouette;
  image: string;
  badge: Badge;
  description: string;
}

// EU 40-45 run for every product, with a deterministic sold-out / low-stock
// pattern per item so the catalogue reads like real, uneven inventory.
function buildSizes(seed: number): ProductSize[] {
  const run = ["39", "40", "41", "42", "43", "44", "45", "46"];
  return run.map((eu, i) => {
    const n = (seed * 7 + i * 13) % 11;
    return {
      eu,
      soldOut: n === 0 || n === 1,
      lowStock: n === 2,
    };
  });
}

interface RawProduct {
  id: string;
  brand: string;
  name: string;
  colorway: string;
  price: number;
  compareAtPrice?: number;
  silhouette: Silhouette;
  badge: Badge;
  description: string;
}

const RAW: RawProduct[] = [
  { id: "adidas-superstar-wotherspoon", brand: "Adidas", name: "Superstar", colorway: "Cream / Green / Yellow", price: 85000, silhouette: "Low-Top", badge: "NEW", description: "The three-stripe icon in a multicolour suede mix — green stripes, mustard tongue tab, cream leather." },
  { id: "adidas-superstar-blush-teddy", brand: "Adidas", name: "Superstar", colorway: "Blush Pink Teddy", price: 88000, silhouette: "Low-Top", badge: null, description: "Teddy-fleece stripes on soft blush leather, brown suede heel. A cold-weather Superstar." },
  { id: "adidas-superstar-triple-black", brand: "Adidas", name: "Superstar", colorway: "Triple Black Suede", price: 78000, silhouette: "Low-Top", badge: null, description: "Tonal black suede upper, blacked-out shell toe. Disappears into any fit." },
  { id: "adidas-superstar-wheat-burgundy", brand: "Adidas", name: "Superstar", colorway: "Wheat / Burgundy", price: 82000, silhouette: "Low-Top", badge: null, description: "Wheat nubuck with burgundy suede stripes and a bone midsole." },
  { id: "adidas-superstar-pony-hair", brand: "Adidas", name: "Superstar", colorway: "Black / White Pony Hair", price: 95000, silhouette: "Low-Top", badge: "TRENDING", description: "Genuine pony-hair stripes on a black leather base. Loud in the right rooms." },
  { id: "adidas-spezial-mint", brand: "Adidas", name: "Handball Spezial", colorway: "Mint / Teal Suede", price: 92000, silhouette: "Low-Top", badge: "NEW", description: "Court-classic Spezial in mint suede, gum sole, gold branding." },
  { id: "adidas-spezial-mustard", brand: "Adidas", name: "Handball Spezial", colorway: "Mustard / Gum", price: 92000, silhouette: "Low-Top", badge: null, description: "Mustard suede Spezial with white stripes and a gum outsole." },
  { id: "fdcp-suede-slipon", brand: "FDCP", name: "Suede Slip-On", colorway: "Triple Black", price: 64000, silhouette: "Slip-On", badge: null, description: "Minimal suede mule, tan lining, moulded sole. No laces, no noise." },
  { id: "adidas-spezial-lilac", brand: "Adidas", name: "Handball Spezial", colorway: "Lilac / Purple", price: 92000, silhouette: "Low-Top", badge: "BACK IN STOCK", description: "Lilac suede Spezial with cream stripes — a softer take on the court classic." },
  { id: "reebok-premier-pink", brand: "Reebok", name: "Premier Road", colorway: "Pink / Silver / Black", price: 105000, silhouette: "Runner", badge: "NEW", description: "Early-2000s runner silhouette in a loud pink and silver colourway." },
  { id: "nike-zoomx-orange", brand: "Nike", name: "ZoomX Runner", colorway: "Total Orange", price: 120000, silhouette: "Runner", badge: "TRENDING", description: "ZoomX foam stack in total orange with a red-fade outsole." },
  { id: "converse-chuck70-sky", brand: "Converse", name: "Chuck 70 Hi", colorway: "Sky Blue", price: 68000, silhouette: "High-Top", badge: null, description: "Rubberised canvas Chuck 70 in a clean sky-blue colourway." },
  { id: "reebok-teal-silver", brand: "Reebok", name: "Premier Road", colorway: "Teal / White / Silver", price: 98000, silhouette: "Runner", badge: null, description: "DMX-cushioned runner in teal and silver mesh." },
  { id: "reebok-white-silver", brand: "Reebok", name: "Premier Road", colorway: "White / Silver", price: 98000, silhouette: "Runner", badge: null, description: "Tonal white-and-silver colourway on the same DMX runner platform." },
  { id: "jordan-ma2-purple", brand: "Jordan", name: "MA2 Runner", colorway: "Purple / Pink / Blue", price: 145000, silhouette: "Runner", badge: "NEW", description: "Chunky Jordan lifestyle runner in a colour-blocked purple and pink." },
  { id: "jordan1-mid-choc-glitter", brand: "Jordan", name: "1 Mid", colorway: "Chocolate Glitter", price: 135000, silhouette: "High-Top", badge: null, description: "Glitter-flecked chocolate suede Jordan 1 Mid on a cream midsole." },
  { id: "converse-move-platform", brand: "Converse", name: "Chuck Taylor Move", colorway: "Black / White Platform", price: 95000, silhouette: "Platform", badge: null, description: "Chunky platform sole under the classic Chuck Taylor upper." },
  { id: "nike-calm-slide-black", brand: "Nike", name: "Calm Slide", colorway: "Triple Black", price: 58000, silhouette: "Slide", badge: null, description: "Foam slide with a ribbed sole and enclosed toe. Recovery-day staple." },
  { id: "converse-chuck70-oxblood", brand: "Converse", name: "Chuck 70 Hi", colorway: "Dark Oxblood", price: 72000, silhouette: "High-Top", badge: null, description: "Deep oxblood canvas Chuck 70 with the vintage-tone midsole." },
  { id: "nike-am270-olive", brand: "Nike", name: "Air Max 270", colorway: "Olive Green", price: 115000, silhouette: "Runner", badge: null, description: "Full-length Max Air heel unit in a tonal olive mesh upper." },
  { id: "nb-9060-sage", brand: "New Balance", name: "9060", colorway: "Sage Green / Black", price: 165000, silhouette: "Runner", badge: "TRENDING", description: "Protection-pack styling in sage suede with black overlays." },
  { id: "jordan5-tour-yellow", brand: "Jordan", name: "5 Retro", colorway: "Tour Yellow", price: 195000, silhouette: "High-Top", badge: "TRENDING", description: "Tour Yellow nubuck upper, reflective 3M tongue, icy translucent sole." },
  { id: "asics-gelnyc-blue", brand: "Asics", name: "Gel-NYC", colorway: "Light Blue", price: 128000, silhouette: "Runner", badge: "NEW", description: "Retro-run silhouette in a soft powder-blue mesh and suede mix." },
  { id: "adidas-superstar-navy-gum", brand: "Adidas", name: "Superstar", colorway: "Navy / Gum", price: 85000, silhouette: "Low-Top", badge: null, description: "Navy leather Superstar with a gum shell toe and gum outsole." },
  { id: "nb-9060-grey", brand: "New Balance", name: "9060", colorway: "Grey", price: 158000, silhouette: "Runner", badge: null, description: "Tonal grey 9060 — the quiet colourway that goes with everything." },
  { id: "nb-9060-stone", brand: "New Balance", name: "9060", colorway: "Stone / Tan / Beige", price: 158000, silhouette: "Runner", badge: "BACK IN STOCK", description: "Warm stone and tan suede mix on the 9060's chunky protection-pack sole." },
  { id: "converse-lift-tan", brand: "Converse", name: "Chuck Taylor Lift", colorway: "Tan Leather Platform", price: 88000, silhouette: "Platform", badge: null, description: "Leather high-top on the Lift platform sole, brass eyelets." },
  { id: "nike-af1-love-forever", brand: "Nike", name: "Air Force 1 Low", colorway: "Love You Forever — Pale Yellow", price: 98000, silhouette: "Low-Top", badge: "SALE", compareAtPrice: 118000, description: "Special-edition AF1 with a translucent pale-yellow gum sole and script detailing." },
  { id: "converse-chuck70-maroon", brand: "Converse", name: "Chuck 70 Hi", colorway: "Maroon / Brown", price: 72000, silhouette: "High-Top", badge: null, description: "Deep maroon canvas Chuck 70, vintage midsole, classic hi-top cut." },
  { id: "drmartens-1461-graffiti", brand: "Dr. Martens", name: "1461", colorway: "Black / Yellow Graffiti", price: 135000, silhouette: "Low-Top", badge: "FINAL PAIR", description: "Graffiti-print leather 3-eye shoe on the air-cushioned 1461 sole." },
  { id: "nike-am270-black-white", brand: "Nike", name: "Air Max 270", colorway: "Black / White", price: 112000, silhouette: "Runner", badge: null, description: "The everyday Air Max 270 colourway — black mesh, white sole, full Max Air heel." },
  { id: "nike-thermal-slide-black", brand: "Nike", name: "Thermal Slide", colorway: "Triple Black", price: 62000, silhouette: "Slide", badge: null, description: "Sculpted foam slide with a ribbed thermal-look upper strap." },
  { id: "gucci-adidas-slide-multi", brand: "Gucci x Adidas", name: "Slide", colorway: "Trefoil Stripe Multi", price: 380000, silhouette: "Slide", badge: "NEW", description: "The Gucci x Adidas collab slide in a three-stripe trefoil colourway." },
  { id: "gucci-adidas-slide-sage", brand: "Gucci x Adidas", name: "Slide", colorway: "Grey / Sage Green", price: 380000, silhouette: "Slide", badge: null, description: "Grey canvas slide with sage-green trefoil stripes, Gucci-lined footbed." },
  { id: "jordan5-belair", brand: "Jordan", name: "5 Retro", colorway: "Bel-Air — White / Red / Green", price: 210000, silhouette: "High-Top", badge: "TRENDING", description: "White nubuck with green and red flame accents on a gum sole, laser-etched tongue." },
];

export const products: Product[] = RAW.map((p, i) => ({
  ...p,
  image: `/products/product${i + 1}.jpg`,
}));

export function getSizesFor(productIndex: number): ProductSize[] {
  return buildSizes(productIndex + 1);
}

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

export function getProductIndex(id: string): number {
  return products.findIndex((p) => p.id === id);
}

export const silhouettes: Silhouette[] = [
  "Low-Top",
  "High-Top",
  "Runner",
  "Slide",
  "Platform",
  "Slip-On",
];

export const badges: Exclude<Badge, null>[] = [
  "NEW",
  "BACK IN STOCK",
  "TRENDING",
  "FINAL PAIR",
  "SALE",
];

export function formatNaira(amount: number): string {
  return `₦${amount.toLocaleString("en-NG")}`;
}
