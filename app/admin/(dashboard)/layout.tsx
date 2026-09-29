import React from "react";
import Link from "next/link";
import { LayoutDashboard, Package, Tag, Mail, Receipt, LogOut } from "lucide-react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdmin } from "@/lib/admin/requireAdmin";
import { signOut } from "../actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin | Clutch Kicks",
  robots: { index: false, follow: false },
};

const NAV = [
  { href: "/admin/", label: "Overview", icon: LayoutDashboard, ready: true },
  { href: "/admin/products/", label: "Products", icon: Package, ready: true },
  { href: "/admin/promotions/", label: "Promotions", icon: Tag, ready: false },
  { href: "/admin/newsletter/", label: "Newsletter", icon: Mail, ready: false },
  { href: "/admin/orders/", label: "Orders", icon: Receipt, ready: false },
];

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  // The middleware already guards /admin; checking again here means a page can
  // never render for a non-admin even if the middleware is skipped.
  let user;
  try {
    ({ user } = await getAdmin());
  } catch {
    redirect("/admin/login/");
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-bg-alt text-ink">
      <aside className="md:w-60 md:min-h-screen shrink-0 bg-bg-invert text-ink-invert flex md:flex-col">
        <div className="hidden md:block px-6 py-6 border-b border-white/10">
          <span className="font-mono text-[11px] uppercase tracking-ultra-wide text-white/50">
            Clutch Kicks
          </span>
          <p className="font-display uppercase text-xl leading-none mt-1">Admin</p>
        </div>

        <nav className="flex md:flex-col flex-1 overflow-x-auto md:overflow-visible md:py-4">
          {NAV.map(({ href, label, icon: Icon, ready }) =>
            ready ? (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-3 px-4 md:px-6 py-3 font-sans text-sm font-semibold whitespace-nowrap hover:bg-white/10"
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ) : (
              <span
                key={href}
                aria-disabled="true"
                className="flex items-center gap-3 px-4 md:px-6 py-3 font-sans text-sm whitespace-nowrap text-white/35 cursor-not-allowed"
              >
                <Icon className="w-4 h-4" />
                {label}
                <span className="font-mono text-[10px] uppercase">Soon</span>
              </span>
            )
          )}
        </nav>

        <form action={signOut} className="md:border-t md:border-white/10 md:p-4">
          <p className="hidden md:block font-sans text-xs text-white/50 truncate mb-2">{user?.email}</p>
          <button
            type="submit"
            className="flex items-center gap-2 px-4 md:px-0 py-3 md:py-0 font-sans text-sm whitespace-nowrap hover:text-volt"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </form>
      </aside>

      <main className="flex-1 min-w-0 p-4 md:p-10">{children}</main>
    </div>
  );
}
