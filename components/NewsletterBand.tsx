"use client";

import React, { useState } from "react";
import { Send, CheckCircle2 } from "lucide-react";

export const NewsletterBand: React.FC = () => {
  const [subscribed, setSubscribed] = useState(false);

  return (
    <section className="w-full bg-volt text-ink">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-14 flex flex-col md:flex-row items-center justify-between gap-6">
        <h3 className="font-display uppercase text-[clamp(24px,3.5vw,36px)] leading-[0.95] text-center md:text-left">
          Drops First.
          <br className="hidden sm:block" /> Restocks Fast.
        </h3>
        {subscribed ? (
          <div className="flex items-center gap-2 font-sans font-semibold text-sm">
            <CheckCircle2 className="w-4 h-4" />
            <span>You&apos;re on the list.</span>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSubscribed(true);
            }}
            className="flex items-stretch w-full max-w-sm"
          >
            <input
              type="email"
              required
              placeholder="Enter your email"
              className="w-full bg-ink text-ink-invert border-2 border-ink px-3.5 py-3 text-sm placeholder-ink-invert/50 focus:outline-none"
            />
            <button
              type="submit"
              aria-label="Subscribe"
              className="bg-ink text-ink-invert px-5 border-2 border-ink hover:bg-transparent hover:text-ink transition-colors shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </section>
  );
};
