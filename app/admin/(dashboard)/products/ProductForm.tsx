"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowDown,
  ArrowUp,
  ChevronLeft,
  ChevronRight,
  ImagePlus,
  Loader2,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { PRODUCT_IMAGES_BUCKET, productImageUrl } from "@/lib/storage";
import { resizeImage } from "@/lib/admin/resizeImage";
import { badges, formatNaira, silhouettes } from "@/data/products";
import { Switch } from "@/components/admin/Switch";
import {
  DEFAULT_RUN,
  EU_SIZES,
  FORM_ERROR,
  type FieldErrors,
  fieldErrorsFromIssues,
  productSchema,
  slugify,
  variantErrorKey,
} from "./schema";
import { saveProduct } from "./actions";

// ---------- Form state ----------

export type SizeState = "in" | "low" | "out";

export interface FormImage {
  id: string;
  storagePath: string;
}

export interface FormVariant {
  id: string;
  colorway: string;
  swatchHex: string | null;
  price: string;
  compareAtPrice: string;
  inStock: boolean;
  isDefault: boolean;
  images: FormImage[];
  sizes: Record<string, SizeState>;
  // Colours after the first one use colour 1's price, 'was' price and sizes
  // unless this is switched off. Ignored on the first colour.
  sameAsFirst: boolean;
}

export interface FormProduct {
  id: string;
  slug: string;
  brand: string;
  name: string;
  description: string;
  silhouette: string;
  badge: string;
  isPublished: boolean;
  variants: FormVariant[];
}

export function newVariant(isDefault = false, sameAsFirst = false): FormVariant {
  return {
    id: crypto.randomUUID(),
    colorway: "",
    swatchHex: null,
    price: "",
    compareAtPrice: "",
    inStock: true,
    isDefault,
    images: [],
    sizes: Object.fromEntries(DEFAULT_RUN.map((eu) => [eu, "in" as SizeState])),
    sameAsFirst,
  };
}

// When a colour that was following colour 1 becomes colour 1 (after a move or
// delete), give it the values it was showing so nothing changes unexpectedly.
function keepFirstStandalone(variants: FormVariant[], oldFirst: FormVariant): FormVariant[] {
  const first = variants[0];
  if (!first?.sameAsFirst) return variants;
  return [
    {
      ...first,
      price: oldFirst.price,
      compareAtPrice: oldFirst.compareAtPrice,
      sizes: { ...oldFirst.sizes },
      sameAsFirst: false,
    },
    ...variants.slice(1),
  ];
}

function sizeSummary(sizes: Record<string, SizeState>): string {
  const list = sortedSizes(Object.keys(sizes)).filter((eu) => sizes[eu]);
  if (list.length === 0) return "no sizes";
  const whole = list.every((eu, i) => i === 0 || parseFloat(eu) - parseFloat(list[i - 1]) === 1);
  return whole && list.length > 2 ? `EU ${list[0]}–${list[list.length - 1]}` : `EU ${list.join(", ")}`;
}

const SIZE_CYCLE: (SizeState | undefined)[] = [undefined, "in", "low", "out"];

const sizeChipStyles: Record<string, string> = {
  none: "border-dashed border-line text-ink-muted hover:border-line-strong",
  in: "bg-ink text-ink-invert border-ink",
  low: "bg-volt text-ink border-ink",
  out: "bg-bg-sunken text-ink-muted border-line line-through",
};

const sizeLabels: Record<string, string> = {
  none: "not stocked",
  in: "in stock",
  low: "low stock",
  out: "sold out",
};

function sortedSizes(keys: string[]): string[] {
  return Array.from(new Set([...EU_SIZES, ...keys])).sort((a, b) => parseFloat(a) - parseFloat(b));
}

function parseNaira(value: string): number {
  const digits = value.replace(/[^\d]/g, "");
  return digits ? Number(digits) : NaN;
}

function toInput(form: FormProduct) {
  const hasDefault = form.variants.some((v) => v.isDefault);
  const first = form.variants[0];
  return {
    id: form.id,
    slug: form.slug,
    brand: form.brand.trim(),
    name: form.name.trim(),
    description: form.description.trim(),
    silhouette: form.silhouette,
    badge: form.badge || null,
    isPublished: form.isPublished,
    variants: form.variants.map((v, i) => {
      const shared = i > 0 && v.sameAsFirst ? first : v;
      return {
        id: v.id,
        colorway: v.colorway.trim(),
        slug: slugify(v.colorway),
        swatchHex: v.swatchHex,
        price: parseNaira(shared.price),
        compareAtPrice: shared.compareAtPrice.trim() ? parseNaira(shared.compareAtPrice) : null,
        inStock: v.inStock,
        isDefault: hasDefault ? v.isDefault : i === 0,
        images: v.images,
        sizes: sortedSizes(Object.keys(shared.sizes)).flatMap((eu) => {
          const state = shared.sizes[eu];
          return state ? [{ eu, inStock: state !== "out", lowStock: state === "low" }] : [];
        }),
      };
    }),
  };
}

// ---------- Small UI pieces ----------

function inputClass(error?: string): string {
  return `h-11 px-3 border-2 bg-bg font-sans text-sm focus:outline-none w-full ${
    error ? "border-red focus:border-red" : "border-line focus:border-line-strong"
  }`;
}

// Marks the element the form scrolls to when this field has an error.
function invalidProps(error?: string) {
  return error ? { "aria-invalid": true, "data-invalid": "true" } : {};
}

const ErrorText: React.FC<{ error?: string }> = ({ error }) =>
  error ? <span className="font-sans text-xs font-semibold text-red">{error}</span> : null;

const Field: React.FC<{ label: string; hint?: string; error?: string; children: React.ReactNode }> = ({
  label,
  hint,
  error,
  children,
}) => (
  <label className="flex flex-col gap-1.5">
    <span className={`font-sans text-xs font-bold uppercase tracking-wide ${error ? "text-red" : ""}`}>{label}</span>
    {children}
    {error ? <ErrorText error={error} /> : hint && <span className="font-sans text-xs text-ink-muted">{hint}</span>}
  </label>
);

// ---------- Form ----------

export const ProductForm: React.FC<{
  initial: FormProduct;
  isNew: boolean;
  brandOptions: string[];
}> = ({ initial, isNew, brandOptions }) => {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [form, setForm] = useState<FormProduct>(initial);
  const [slugTouched, setSlugTouched] = useState(!isNew);
  const [errors, setErrors] = useState<FieldErrors>({});
  // Photo upload failures, per colour.
  const [uploadErrors, setUploadErrors] = useState<Record<string, string[]>>({});
  const [uploading, setUploading] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState(false);
  // Bumped on each failed save so the effect below jumps to the first bad field.
  const [focusRequest, setFocusRequest] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (focusRequest === 0) return;
    // querySelector returns the first match in page order, i.e. the topmost problem.
    const target = formRef.current?.querySelector<HTMLElement>('[data-invalid="true"]');
    if (!target) return;
    target.scrollIntoView({ behavior: "smooth", block: "center" });
    target.focus({ preventScroll: true });
  }, [focusRequest]);

  function clearErrors(...keys: string[]) {
    setErrors((e) => {
      if (!keys.some((k) => k in e)) return e;
      const next = { ...e };
      for (const k of keys) delete next[k];
      return next;
    });
  }

  // Photos already stored in the database. Anything else was uploaded during this
  // edit, so removing it before saving should delete the file straight away.
  const savedImageIds = useRef(new Set(initial.variants.flatMap((v) => v.images.map((img) => img.id))));

  const isUploading = Object.values(uploading).some((n) => n > 0);

  function update(patch: Partial<FormProduct>) {
    const touched: string[] = Object.keys(patch);
    if (!slugTouched && ("brand" in patch || "name" in patch)) touched.push("slug");
    // Photos are only required when publishing.
    if (patch.isPublished === false) touched.push(...form.variants.map((v) => variantErrorKey(v.id, "images")));
    clearErrors(...touched);
    setForm((f) => {
      const next = { ...f, ...patch };
      if (!slugTouched && ("brand" in patch || "name" in patch)) {
        next.slug = slugify(`${next.brand} ${next.name}`);
      }
      return next;
    });
  }

  function updateVariant(id: string, fn: (v: FormVariant) => FormVariant, ...fields: string[]) {
    clearErrors(...fields.map((field) => variantErrorKey(id, field)));
    setForm((f) => ({ ...f, variants: f.variants.map((v) => (v.id === id ? fn(v) : v)) }));
  }

  function setDefault(id: string) {
    setForm((f) => ({ ...f, variants: f.variants.map((v) => ({ ...v, isDefault: v.id === id })) }));
  }

  function moveVariant(index: number, delta: number) {
    setForm((f) => {
      const variants = [...f.variants];
      const target = index + delta;
      if (target < 0 || target >= variants.length) return f;
      [variants[index], variants[target]] = [variants[target], variants[index]];
      return { ...f, variants: keepFirstStandalone(variants, f.variants[0]) };
    });
  }

  function setSameAsFirst(id: string, sameAsFirst: boolean) {
    clearErrors(...["price", "compareAtPrice", "sizes"].map((field) => variantErrorKey(id, field)));
    setForm((f) => {
      const first = f.variants[0];
      return {
        ...f,
        variants: f.variants.map((v) =>
          v.id !== id
            ? v
            : sameAsFirst
              ? { ...v, sameAsFirst }
              : // Start the override from colour 1's values so only the difference needs typing.
                { ...v, sameAsFirst, price: first.price, compareAtPrice: first.compareAtPrice, sizes: { ...first.sizes } }
        ),
      };
    });
  }

  function discardUnsavedFiles(images: FormImage[]) {
    const paths = images.filter((img) => !savedImageIds.current.has(img.id)).map((img) => img.storagePath);
    if (paths.length) void supabase.storage.from(PRODUCT_IMAGES_BUCKET).remove(paths);
  }

  function removeVariant(variant: FormVariant, index: number) {
    const label = variant.colorway || `Colour ${index + 1}`;
    if (!confirm(`Remove ${label}? Its photos will be deleted when you save.`)) return;
    discardUnsavedFiles(variant.images);
    setForm((f) => {
      let variants = keepFirstStandalone(
        f.variants.filter((v) => v.id !== variant.id),
        f.variants[0]
      );
      if (variant.isDefault && variants[0]) {
        variants = [{ ...variants[0], isDefault: true }, ...variants.slice(1)];
      }
      return { ...f, variants };
    });
  }

  function removeImage(variantId: string, image: FormImage) {
    discardUnsavedFiles([image]);
    updateVariant(variantId, (v) => ({ ...v, images: v.images.filter((img) => img.id !== image.id) }));
  }

  function moveImage(variantId: string, index: number, delta: number) {
    updateVariant(variantId, (v) => {
      const images = [...v.images];
      const target = index + delta;
      if (target < 0 || target >= images.length) return v;
      [images[index], images[target]] = [images[target], images[index]];
      return { ...v, images };
    });
  }

  async function uploadFiles(variantId: string, files: File[]) {
    setUploadErrors((u) => ({ ...u, [variantId]: [] }));
    setUploading((u) => ({ ...u, [variantId]: (u[variantId] ?? 0) + files.length }));
    for (const file of files) {
      try {
        const blob = await resizeImage(file);
        const imageId = crypto.randomUUID();
        const ext = blob.type === "image/webp" ? "webp" : "jpg";
        const path = `${form.id}/${variantId}/${imageId}.${ext}`;
        const { error } = await supabase.storage
          .from(PRODUCT_IMAGES_BUCKET)
          .upload(path, blob, { contentType: blob.type, cacheControl: "31536000", upsert: false });
        if (error) throw error;
        updateVariant(
          variantId,
          (v) => ({ ...v, images: [...v.images, { id: imageId, storagePath: path }] }),
          "images"
        );
      } catch (e) {
        setUploadErrors((u) => ({
          ...u,
          [variantId]: [...(u[variantId] ?? []), `${file.name}: ${(e as Error).message}`],
        }));
      } finally {
        setUploading((u) => ({ ...u, [variantId]: (u[variantId] ?? 1) - 1 }));
      }
    }
  }

  function cycleSize(variantId: string, eu: string) {
    updateVariant(variantId, (v) => {
      const next = SIZE_CYCLE[(SIZE_CYCLE.indexOf(v.sizes[eu]) + 1) % SIZE_CYCLE.length];
      const sizes = { ...v.sizes };
      if (next) sizes[eu] = next;
      else delete sizes[eu];
      return { ...v, sizes };
    }, "sizes");
  }

  function showErrors(next: FieldErrors) {
    setErrors(next);
    setFocusRequest((n) => n + 1);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isUploading) {
      showErrors({ [FORM_ERROR]: "Wait for the photos to finish uploading." });
      return;
    }
    const parsed = productSchema.safeParse(toInput(form));
    if (!parsed.success) {
      const next = fieldErrorsFromIssues(
        parsed.error.issues,
        form.variants.map((v) => v.id)
      );
      // An empty URL name just means brand/name are missing; it fills itself in once they're typed.
      if (!slugTouched && !form.slug && (next.brand || next.name)) delete next.slug;
      showErrors(next);
      return;
    }

    setSaving(true);
    try {
      const result = await saveProduct(parsed.data);
      if (!result.ok) {
        showErrors(result.errors);
        return;
      }
      savedImageIds.current = new Set(parsed.data.variants.flatMap((v) => v.images.map((img) => img.id)));
      router.push("/admin/products/?saved=1");
      router.refresh();
    } catch (err) {
      showErrors({ [FORM_ERROR]: `Couldn't save: ${(err as Error).message}` });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate className="max-w-4xl pb-28">
      <div>
        <Link
          href="/admin/products/"
          className="inline-flex items-center gap-1 font-mono text-xs uppercase tracking-wide text-ink-muted hover:text-ink"
        >
          <ChevronLeft className="w-3 h-3" />
          Products
        </Link>
        <h1 className="font-display uppercase text-[clamp(28px,4vw,40px)] leading-none mt-2">
          {isNew ? "Add Product" : `${initial.brand} ${initial.name}`}
        </h1>
      </div>

      {/* ---------- Details ---------- */}
      <section className="mt-8 bg-bg border-2 border-line p-5 md:p-6">
        <h2 className="font-sans text-xs font-bold uppercase tracking-ultra-wide text-ink-muted">Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-4">
          <Field label="Brand" error={errors.brand}>
            <input
              list="brand-options"
              value={form.brand}
              onChange={(e) => update({ brand: e.target.value })}
              placeholder="Adidas"
              className={inputClass(errors.brand)}
              {...invalidProps(errors.brand)}
            />
            <datalist id="brand-options">
              {brandOptions.map((b) => (
                <option key={b} value={b} />
              ))}
            </datalist>
          </Field>
          <Field label="Product name" error={errors.name}>
            <input
              value={form.name}
              onChange={(e) => update({ name: e.target.value })}
              placeholder="Superstar"
              className={inputClass(errors.name)}
              {...invalidProps(errors.name)}
            />
          </Field>
          <Field label="Silhouette" error={errors.silhouette}>
            <select
              value={form.silhouette}
              onChange={(e) => update({ silhouette: e.target.value })}
              className={inputClass(errors.silhouette)}
              {...invalidProps(errors.silhouette)}
            >
              <option value="" disabled>
                Choose…
              </option>
              {silhouettes.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Badge" hint="Shown on the product photo. Optional." error={errors.badge}>
            <select
              value={form.badge}
              onChange={(e) => update({ badge: e.target.value })}
              className={inputClass(errors.badge)}
              {...invalidProps(errors.badge)}
            >
              <option value="">None</option>
              {badges.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </Field>
          <div className="md:col-span-2">
            <Field label="Description" error={errors.description}>
              <textarea
                value={form.description}
                onChange={(e) => update({ description: e.target.value })}
                rows={3}
                placeholder="Tonal black suede upper, blacked-out shell toe."
                className={`${inputClass(errors.description)} h-auto py-2.5 resize-y`}
                {...invalidProps(errors.description)}
              />
            </Field>
          </div>
          <div className="md:col-span-2">
            <Field label="URL name" hint={`Page address: /products/${form.slug || "…"}`} error={errors.slug}>
              <input
                value={form.slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  update({ slug: slugify(e.target.value) });
                }}
                className={`${inputClass(errors.slug)} font-mono`}
                {...invalidProps(errors.slug)}
              />
            </Field>
          </div>
        </div>
      </section>

      {/* ---------- Colours ---------- */}
      <section className="mt-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="font-sans text-xs font-bold uppercase tracking-ultra-wide text-ink-muted">Colours</h2>
            <p className="font-sans text-xs text-ink-muted mt-1">
              Each colour needs a name and photos. Extra colours use colour 1&apos;s price and sizes unless you change
              them. Shoppers switch between colours on one product.
            </p>
            {errors.variants && (
              <p tabIndex={-1} className="mt-2 outline-none" {...invalidProps(errors.variants)}>
                <ErrorText error={errors.variants} />
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-5 mt-4">
          {form.variants.map((variant, index) => {
            const pending = uploading[variant.id] ?? 0;
            const price = parseNaira(variant.price);
            const first = form.variants[0];
            const follows = index > 0 && variant.sameAsFirst;
            const firstPrice = parseNaira(first.price);
            const firstWas = parseNaira(first.compareAtPrice);
            const err = (field: string) => errors[variantErrorKey(variant.id, field)];
            // A colour following colour 1 hides its price and sizes, so only its own fields count.
            const hasError = (follows ? ["colorway", "images"] : ["colorway", "price", "compareAtPrice", "sizes", "images"]).some(err);
            const photoProblems = uploadErrors[variant.id] ?? [];
            return (
              <div
                key={variant.id}
                className={`bg-bg border-2 p-5 md:p-6 ${hasError ? "border-red" : "border-line"}`}
              >
                {/* Header */}
                <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
                  <h3 className="font-sans font-bold text-sm uppercase tracking-wide mr-auto">
                    Colour {index + 1}
                    {variant.colorway && <span className="text-ink-muted normal-case font-semibold"> · {variant.colorway}</span>}
                  </h3>
                  <label className="flex items-center gap-2 font-sans text-xs cursor-pointer">
                    <input
                      type="radio"
                      name="default-variant"
                      checked={variant.isDefault}
                      onChange={() => setDefault(variant.id)}
                      className="accent-ink w-4 h-4"
                    />
                    Main colour
                  </label>
                  <span className="flex items-center gap-2 font-sans text-xs">
                    <Switch
                      label="In stock"
                      checked={variant.inStock}
                      onChange={(inStock) => updateVariant(variant.id, (v) => ({ ...v, inStock }))}
                    />
                    In stock
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => moveVariant(index, -1)}
                      disabled={index === 0}
                      aria-label="Move colour up"
                      className="w-8 h-8 flex items-center justify-center border-2 border-line hover:border-line-strong disabled:opacity-30"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveVariant(index, 1)}
                      disabled={index === form.variants.length - 1}
                      aria-label="Move colour down"
                      className="w-8 h-8 flex items-center justify-center border-2 border-line hover:border-line-strong disabled:opacity-30"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                    {form.variants.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeVariant(variant, index)}
                        aria-label="Remove colour"
                        className="w-8 h-8 flex items-center justify-center border-2 border-line hover:border-red hover:text-red"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
                  <Field label="Colour name" error={err("colorway")}>
                    <input
                      value={variant.colorway}
                      onChange={(e) =>
                        updateVariant(variant.id, (v) => ({ ...v, colorway: e.target.value }), "colorway")
                      }
                      placeholder="Triple Black Suede"
                      className={inputClass(err("colorway"))}
                      {...invalidProps(err("colorway"))}
                    />
                  </Field>
                  <Field label="Swatch" hint={variant.swatchHex ? "Dot shown when switching colours." : "None set: the photo is used instead."}>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={variant.swatchHex ?? "#000000"}
                        onChange={(e) => updateVariant(variant.id, (v) => ({ ...v, swatchHex: e.target.value }))}
                        className="h-11 w-14 border-2 border-line bg-bg p-1 cursor-pointer"
                      />
                      {variant.swatchHex && (
                        <button
                          type="button"
                          onClick={() => updateVariant(variant.id, (v) => ({ ...v, swatchHex: null }))}
                          className="font-sans text-xs underline underline-offset-4 text-ink-muted hover:text-ink"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </Field>
                  {!follows && (
                    <>
                      <Field
                        label="Price (₦)"
                        hint={Number.isNaN(price) ? undefined : formatNaira(price)}
                        error={err("price")}
                      >
                        <input
                          inputMode="numeric"
                          value={variant.price}
                          // The 'was' price is checked against this one, so clear both.
                          onChange={(e) =>
                            updateVariant(variant.id, (v) => ({ ...v, price: e.target.value }), "price", "compareAtPrice")
                          }
                          placeholder="78000"
                          className={inputClass(err("price"))}
                          {...invalidProps(err("price"))}
                        />
                      </Field>
                      <Field
                        label="'Was' price (₦)"
                        hint="Optional. Shown crossed out next to the price."
                        error={err("compareAtPrice")}
                      >
                        <input
                          inputMode="numeric"
                          value={variant.compareAtPrice}
                          onChange={(e) =>
                            updateVariant(variant.id, (v) => ({ ...v, compareAtPrice: e.target.value }), "compareAtPrice")
                          }
                          placeholder="—"
                          className={inputClass(err("compareAtPrice"))}
                          {...invalidProps(err("compareAtPrice"))}
                        />
                      </Field>
                    </>
                  )}
                </div>

                {index > 0 && (
                  <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 border-2 border-line bg-bg-alt px-4 py-3">
                    <p className="font-sans text-xs mr-auto">
                      {follows ? (
                        <>
                          <span className="font-bold">Same price and sizes as colour 1:</span>{" "}
                          <span className="text-ink-muted">
                            {Number.isNaN(firstPrice) ? "no price yet" : formatNaira(firstPrice)}
                            {!Number.isNaN(firstWas) && <> (was {formatNaira(firstWas)})</>} · {sizeSummary(first.sizes)}
                          </span>
                        </>
                      ) : (
                        <span className="font-bold">This colour has its own price and sizes.</span>
                      )}
                    </p>
                    <button
                      type="button"
                      onClick={() => setSameAsFirst(variant.id, !follows)}
                      className="font-sans text-xs underline underline-offset-4 text-ink-muted hover:text-ink"
                    >
                      {follows ? "Set a different price or sizes" : "Use colour 1's price and sizes"}
                    </button>
                  </div>
                )}

                {/* Photos */}
                <div tabIndex={-1} className="mt-6 outline-none scroll-mt-6" {...invalidProps(err("images"))}>
                  <span className={`font-sans text-xs font-bold uppercase tracking-wide ${err("images") ? "text-red" : ""}`}>
                    Photos
                  </span>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 mt-2">
                    {variant.images.map((image, i) => (
                      <div key={image.id} className="relative aspect-square bg-bg-sunken border-2 border-line group">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={productImageUrl(image.storagePath)} alt="" className="w-full h-full object-cover" />
                        {i === 0 && (
                          <span className="absolute top-1 left-1 px-1.5 py-0.5 bg-ink text-ink-invert font-mono text-[10px] uppercase">
                            Main
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => removeImage(variant.id, image)}
                          aria-label="Remove photo"
                          className="absolute top-1 right-1 w-6 h-6 flex items-center justify-center bg-bg border border-line hover:text-red"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                        <div className="absolute bottom-1 inset-x-1 flex justify-between">
                          <button
                            type="button"
                            onClick={() => moveImage(variant.id, i, -1)}
                            disabled={i === 0}
                            aria-label="Move photo left"
                            className="w-6 h-6 flex items-center justify-center bg-bg border border-line disabled:opacity-0"
                          >
                            <ChevronLeft className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveImage(variant.id, i, 1)}
                            disabled={i === variant.images.length - 1}
                            aria-label="Move photo right"
                            className="w-6 h-6 flex items-center justify-center bg-bg border border-line disabled:opacity-0"
                          >
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                    {Array.from({ length: pending }).map((_, i) => (
                      <div key={`pending-${i}`} className="aspect-square bg-bg-sunken border-2 border-line flex items-center justify-center">
                        <Loader2 className="w-5 h-5 animate-spin text-ink-muted" />
                      </div>
                    ))}
                    <label
                      className={`aspect-square border-2 border-dashed flex flex-col items-center justify-center gap-1 cursor-pointer hover:text-ink ${
                        err("images") ? "border-red text-red" : "border-line hover:border-line-strong text-ink-muted"
                      }`}
                    >
                      <ImagePlus className="w-5 h-5" />
                      <span className="font-sans text-[11px] font-semibold">Add photos</span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/avif"
                        multiple
                        className="sr-only"
                        onChange={(e) => {
                          const files = Array.from(e.target.files ?? []);
                          e.target.value = "";
                          if (files.length) void uploadFiles(variant.id, files);
                        }}
                      />
                    </label>
                  </div>
                  <p className="font-sans text-xs mt-2">
                    {err("images") ? (
                      <ErrorText error={err("images")} />
                    ) : (
                      <span className="text-ink-muted">The first photo is the one shown on the shop card.</span>
                    )}
                  </p>
                  {photoProblems.length > 0 && (
                    <ul role="alert" className="mt-1 font-sans text-xs text-red space-y-0.5">
                      {photoProblems.map((msg) => (
                        <li key={msg}>Didn&apos;t upload {msg}</li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Sizes */}
                {!follows && (
                <div tabIndex={-1} className="mt-6 outline-none" {...invalidProps(err("sizes"))}>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                    <span
                      className={`font-sans text-xs font-bold uppercase tracking-wide mr-auto ${err("sizes") ? "text-red" : ""}`}
                    >
                      Sizes (EU)
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        updateVariant(
                          variant.id,
                          (v) => ({
                            ...v,
                            sizes: Object.fromEntries(DEFAULT_RUN.map((eu) => [eu, "in" as SizeState])),
                          }),
                          "sizes"
                        )
                      }
                      className="font-sans text-xs underline underline-offset-4 text-ink-muted hover:text-ink"
                    >
                      Reset to 39–46
                    </button>
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() =>
                          updateVariant(variant.id, (v) => ({ ...v, sizes: { ...form.variants[0].sizes } }), "sizes")
                        }
                        className="font-sans text-xs underline underline-offset-4 text-ink-muted hover:text-ink"
                      >
                        Copy from colour 1
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => updateVariant(variant.id, (v) => ({ ...v, sizes: {} }))}
                      className="font-sans text-xs underline underline-offset-4 text-ink-muted hover:text-ink"
                    >
                      Clear
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {sortedSizes(Object.keys(variant.sizes)).map((eu) => {
                      const state = variant.sizes[eu] ?? "none";
                      return (
                        <button
                          key={eu}
                          type="button"
                          onClick={() => cycleSize(variant.id, eu)}
                          title={`EU ${eu}: ${sizeLabels[state]} (tap to change)`}
                          aria-label={`EU ${eu}, ${sizeLabels[state]}`}
                          className={`min-w-[44px] h-10 px-2 font-mono text-sm border-2 transition-colors ${sizeChipStyles[state]}`}
                        >
                          {eu}
                        </button>
                      );
                    })}
                  </div>
                  {err("sizes") && (
                    <p className="mt-2">
                      <ErrorText error={err("sizes")} />
                    </p>
                  )}
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 font-sans text-[11px] text-ink-muted">
                    <span>Tap a size to change it:</span>
                    {(["none", "in", "low", "out"] as const).map((s) => (
                      <span key={s} className="flex items-center gap-1.5">
                        <span className={`inline-block w-3 h-3 border-2 ${sizeChipStyles[s]}`} />
                        {sizeLabels[s]}
                      </span>
                    ))}
                  </div>
                </div>
                )}
              </div>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() =>
            setForm((f) => ({
              ...f,
              variants: [...f.variants, newVariant(f.variants.length === 0, f.variants.length > 0)],
            }))
          }
          className="mt-5 w-full h-12 flex items-center justify-center gap-2 border-2 border-dashed border-line-strong font-sans text-sm font-bold uppercase tracking-wide hover:bg-ink hover:text-ink-invert transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add another colour
        </button>
      </section>

      {/* ---------- Save bar ---------- */}
      <div className="fixed bottom-0 left-0 right-0 md:left-60 z-30 bg-bg border-t-2 border-line px-4 md:px-10 py-3">
        <div className="max-w-4xl flex flex-wrap items-center gap-4">
          <span className="flex items-center gap-2 font-sans text-sm">
            <Switch label="Published" checked={form.isPublished} onChange={(isPublished) => update({ isPublished })} />
            {form.isPublished ? "Published: visible on the shop" : "Draft: hidden from the shop"}
          </span>
          {errors[FORM_ERROR] && (
            <p role="alert" className="font-sans text-sm font-semibold text-red">
              {errors[FORM_ERROR]}
            </p>
          )}
          <div className="ml-auto flex items-center gap-2">
            <Link
              href="/admin/products/"
              className="h-11 px-5 flex items-center border-2 border-line font-sans text-sm font-bold uppercase tracking-wide hover:border-line-strong"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving || isUploading}
              className="h-11 px-6 flex items-center gap-2 bg-ink text-ink-invert border-2 border-ink font-sans text-sm font-bold uppercase tracking-wide hover:bg-transparent hover:text-ink transition-colors disabled:opacity-60"
            >
              {(saving || isUploading) && <Loader2 className="w-4 h-4 animate-spin" />}
              {saving ? "Saving…" : isUploading ? "Uploading…" : "Save Product"}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};
