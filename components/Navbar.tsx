"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, User, ShoppingBag } from "lucide-react";
import { useCart } from "./cart/CartContext";

export const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { count, openCart } = useCart();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "/products", label: "Shop" },
    { href: "/products?filter=new", label: "New Drops" },
    { href: "/products?filter=sale", label: "Sale" },
  ];

  return (
    <header
      className={`fixed top-10 left-0 right-0 z-50 bg-bg-invert transition-shadow duration-150 ${
        scrolled ? "shadow-lift" : ""
      }`}
    >
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/clutch-kicks-logo-navbar.png"
            alt="Clutch Kicks — Stepping Correct"
            className="h-7 sm:h-8 w-auto bg-ink-invert px-2 py-1"
          />
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => {
            const isActive = pathname === link.href.split("?")[0];
            return (
              <Link
                key={link.label}
                href={link.href}
                className={`font-sans text-sm font-semibold uppercase tracking-wide transition-colors ${
                  isActive ? "text-ink-invert" : "text-ink-invert/60 hover:text-ink-invert"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Search"
            className="w-11 h-11 flex items-center justify-center text-ink-invert hover:text-volt transition-colors"
          >
            <Search className="w-[22px] h-[22px]" strokeWidth={1.5} />
          </button>
          <button
            type="button"
            aria-label="Account"
            className="w-11 h-11 hidden sm:flex items-center justify-center text-ink-invert hover:text-volt transition-colors"
          >
            <User className="w-[22px] h-[22px]" strokeWidth={1.5} />
          </button>
          <button
            type="button"
            aria-label={`Cart, ${count} items`}
            onClick={openCart}
            className="relative w-11 h-11 flex items-center justify-center text-ink-invert hover:text-volt transition-colors"
          >
            <ShoppingBag className="w-[22px] h-[22px]" strokeWidth={1.5} />
            {count > 0 && (
              <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full bg-red text-ink-invert text-[10px] font-bold flex items-center justify-center">
                {count}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
