import { randomUUID } from "crypto";
import { ProductForm, type FormProduct } from "../ProductForm";
import { DEFAULT_RUN } from "../schema";
import { getBrandOptions } from "../brandOptions";

export default async function NewProductPage() {
  // IDs are created up front so photos can be uploaded into this product's
  // folder before the first save.
  const initial: FormProduct = {
    id: randomUUID(),
    slug: "",
    brand: "",
    name: "",
    description: "",
    silhouette: "",
    badge: "",
    isPublished: true,
    variants: [
      {
        id: randomUUID(),
        colorway: "",
        swatchHex: null,
        price: "",
        compareAtPrice: "",
        inStock: true,
        isDefault: true,
        images: [],
        sizes: Object.fromEntries(DEFAULT_RUN.map((eu) => [eu, "in" as const])),
        sameAsFirst: false,
      },
    ],
  };

  return <ProductForm initial={initial} isNew brandOptions={await getBrandOptions()} />;
}
