"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ImageOff, Pencil, Search, Trash2 } from "lucide-react";
import { Switch } from "@/components/admin/Switch";
import { formatNaira } from "@/data/products";
import { deleteProduct, setProductInStock, setProductPublished } from "./actions";

export interface ProductRow {
  id: string;
  slug: string;
  brand: string;
  name: string;
  colorways: string[];
  thumb: string | null;
  minPrice: number;
  maxPrice: number;
  isPublished: boolean;
  inStock: boolean;
}

function priceLabel(row: ProductRow) {
  return row.minPrice === row.maxPrice
    ? formatNaira(row.minPrice)
    : `${formatNaira(row.minPrice)} – ${formatNaira(row.maxPrice)}`;
}

export const ProductsTable: React.FC<{ rows: ProductRow[] }> = ({ rows }) => {
  const router = useRouter();
  const [query, setQuery] = useState("");
  // Optimistic overrides while a switch is saving
  const [overrides, setOverrides] = useState<Record<string, Partial<ProductRow>>>({});
  const [busy, setBusy] = useState<string | null>(null);

  const q = query.trim().toLowerCase();
  const visible = rows
    .map((r) => ({ ...r, ...overrides[r.id] }))
    .filter(
      (r) =>
        !q ||
        r.brand.toLowerCase().includes(q) ||
        r.name.toLowerCase().includes(q) ||
        r.colorways.some((c) => c.toLowerCase().includes(q))
    );

  async function toggle(row: ProductRow, field: "isPublished" | "inStock", value: boolean) {
    setOverrides((o) => ({ ...o, [row.id]: { ...o[row.id], [field]: value } }));
    try {
      if (field === "isPublished") await setProductPublished(row.id, value);
      else await setProductInStock(row.id, value);
      router.refresh();
    } catch (e) {
      setOverrides((o) => ({ ...o, [row.id]: { ...o[row.id], [field]: !value } }));
      alert(`Couldn't save: ${(e as Error).message}`);
    }
  }

  async function remove(row: ProductRow) {
    if (!confirm(`Delete ${row.brand} ${row.name} and all its colours and photos? This can't be undone.`)) return;
    setBusy(row.id);
    try {
      await deleteProduct(row.id);
      router.refresh();
    } catch (e) {
      alert(`Couldn't delete: ${(e as Error).message}`);
    } finally {
      setBusy(null);
    }
  }

  if (rows.length === 0) {
    return (
      <div className="mt-8 border-2 border-dashed border-line bg-bg p-12 text-center">
        <p className="font-sans text-sm text-ink-muted">No products yet.</p>
        <Link href="/admin/products/new/" className="inline-block mt-3 font-sans text-sm font-bold underline underline-offset-4">
          Add your first product
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <label className="flex items-center gap-2 h-11 px-3 border-2 border-line bg-bg max-w-sm focus-within:border-line-strong">
        <Search className="w-4 h-4 text-ink-muted" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search brand, name or colour"
          className="flex-1 bg-transparent font-sans text-sm focus:outline-none"
        />
      </label>

      <div className="mt-4 bg-bg border-2 border-line divide-y-2 divide-line">
        <div className="hidden md:grid grid-cols-[56px_1fr_150px_90px_90px_88px] gap-4 px-4 py-3 font-mono text-[11px] uppercase tracking-ultra-wide text-ink-muted">
          <span />
          <span>Product</span>
          <span>Price</span>
          <span>Published</span>
          <span>In stock</span>
          <span />
        </div>

        {visible.map((row) => (
          <div
            key={row.id}
            className={`grid grid-cols-[56px_1fr_auto] md:grid-cols-[56px_1fr_150px_90px_90px_88px] items-center gap-x-4 gap-y-3 px-4 py-3 ${
              busy === row.id ? "opacity-50" : ""
            }`}
          >
            <div className="w-14 h-14 bg-bg-sunken flex items-center justify-center overflow-hidden">
              {row.thumb ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={row.thumb} alt="" className="w-full h-full object-cover" />
              ) : (
                <ImageOff className="w-5 h-5 text-ink-muted" />
              )}
            </div>

            <div className="min-w-0">
              <p className="font-mono text-[11px] uppercase tracking-ultra-wide text-ink-muted">{row.brand}</p>
              <Link href={`/admin/products/${row.id}/`} className="font-sans font-semibold hover:underline underline-offset-2">
                {row.name}
              </Link>
              <p className="font-sans text-xs text-ink-muted truncate">
                {row.colorways.length} {row.colorways.length === 1 ? "colour" : "colours"} · {row.colorways.join(", ")}
              </p>
              <p className="md:hidden font-sans text-xs font-semibold mt-0.5">{priceLabel(row)}</p>
            </div>

            <span className="hidden md:block font-sans text-sm">{priceLabel(row)}</span>

            <div className="col-span-3 md:col-span-1 flex md:block items-center gap-2 order-last md:order-none">
              <Switch
                label="Published"
                checked={row.isPublished}
                onChange={(v) => toggle(row, "isPublished", v)}
              />
              <span className="md:hidden font-sans text-xs text-ink-muted mr-4">Published</span>
              <span className="md:hidden">
                <Switch label="In stock" checked={row.inStock} onChange={(v) => toggle(row, "inStock", v)} />
              </span>
              <span className="md:hidden font-sans text-xs text-ink-muted">In stock</span>
            </div>

            <div className="hidden md:block">
              <Switch label="In stock" checked={row.inStock} onChange={(v) => toggle(row, "inStock", v)} />
            </div>

            <div className="flex items-center justify-end gap-1">
              <Link
                href={`/admin/products/${row.id}/`}
                aria-label={`Edit ${row.name}`}
                className="w-9 h-9 flex items-center justify-center border-2 border-line hover:border-line-strong"
              >
                <Pencil className="w-4 h-4" />
              </Link>
              <button
                type="button"
                onClick={() => remove(row)}
                disabled={busy === row.id}
                aria-label={`Delete ${row.name}`}
                className="w-9 h-9 flex items-center justify-center border-2 border-line hover:border-red hover:text-red"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        {visible.length === 0 && (
          <p className="px-4 py-10 text-center font-sans text-sm text-ink-muted">No products match “{query}”.</p>
        )}
      </div>
    </div>
  );
};
