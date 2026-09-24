"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Send, CheckCircle2 } from "lucide-react";

const COLUMNS = [
  {
    title: "Shop",
    links: [
      { label: "All Products", href: "/products" },
      { label: "New Drops", href: "/products?filter=new" },
      { label: "Sale", href: "/products?filter=sale" },
    ],
  },
  {
    title: "Client Care",
    links: [
      { label: "Size & Fit Guide", href: "/products" },
      { label: "Same-Day Lagos Delivery", href: "/products" },
      { label: "14-Day Returns", href: "/products" },
      { label: "WhatsApp Concierge", href: "https://wa.me/2348000000000" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Home", href: "/" },
      { label: "About", href: "/" },
    ],
  },
];

export const Footer: React.FC = () => {
  const [subscribed, setSubscribed] = useState(false);

  return (
    <footer className="w-full bg-bg-invert text-ink-invert">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 pt-16 pb-10">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 pb-12 border-b border-ink-invert/15">
          {COLUMNS.map((col) => (
            <div key={col.title} className="flex flex-col gap-3">
              <h4 className="font-mono text-xs font-bold uppercase tracking-ultra-wide">
                {col.title}
              </h4>
              <ul className="flex flex-col gap-2.5 text-sm font-sans text-ink-invert/70">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="hover:text-volt transition-colors">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="col-span-2 md:col-span-2 flex flex-col gap-3">
            <h4 className="font-mono text-xs font-bold uppercase tracking-ultra-wide">
              Newsletter
            </h4>
            <p className="text-sm font-sans text-ink-invert/70 max-w-xs">
              Restocks and new colourways. No spam.
            </p>
            {subscribed ? (
              <div className="flex items-center gap-2 text-volt font-sans text-sm font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                <span>You&apos;re on the list.</span>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setSubscribed(true);
                }}
                className="flex items-stretch max-w-xs mt-1"
              >
                <input
                  type="email"
                  required
                  placeholder="Enter your email"
                  className="w-full bg-transparent border-2 border-ink-invert/30 px-3.5 py-2.5 text-sm text-ink-invert placeholder-ink-invert/40 focus:outline-none focus:border-volt"
                />
                <button
                  type="submit"
                  aria-label="Subscribe"
                  className="bg-volt text-ink px-4 border-2 border-volt hover:bg-transparent hover:text-volt transition-colors shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs font-mono uppercase tracking-wide text-ink-invert/50">
          <div className="flex items-center gap-5">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-volt transition-colors">
              Instagram
            </a>
            <a href="https://x.com" target="_blank" rel="noopener noreferrer" className="hover:text-volt transition-colors">
              X / Twitter
            </a>
            <a href="https://wa.me/2348000000000" target="_blank" rel="noopener noreferrer" className="hover:text-volt transition-colors">
              WhatsApp
            </a>
          </div>
          <div>© {new Date().getFullYear()} Clutch Kicks. All rights reserved.</div>
        </div>

        <div className="mt-12 flex justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/clutch-kicks-logo-navbar.png"
            alt="Clutch Kicks — Stepping Correct"
            className="h-14 sm:h-16 w-auto bg-ink-invert px-4 py-2"
          />
        </div>
      </div>
    </footer>
  );
};
