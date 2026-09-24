"use client";

import React, { useEffect, useState } from "react";
import { Footprints } from "lucide-react";

const STEP_COUNT = 5;
const STEP_STAGGER_MS = 160;
const STEPS_START_MS = 650;
const EXIT_START_MS = STEPS_START_MS + STEP_COUNT * STEP_STAGGER_MS + 500;
const EXIT_DURATION_MS = 550;

export const Loader: React.FC = () => {
  const [visible, setVisible] = useState(true);
  const [stepsStarted, setStepsStarted] = useState(false);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const alreadyLoaded = sessionStorage.getItem("ck-loaded");
    if (alreadyLoaded) {
      setVisible(false);
      return;
    }

    const stepsTimer = setTimeout(() => setStepsStarted(true), STEPS_START_MS);
    const fadeTimer = setTimeout(() => setFading(true), EXIT_START_MS);
    const removeTimer = setTimeout(() => {
      setVisible(false);
      sessionStorage.setItem("ck-loaded", "1");
    }, EXIT_START_MS + EXIT_DURATION_MS);

    return () => {
      clearTimeout(stepsTimer);
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-white transition-all ease-out ${
        fading ? "opacity-0 -translate-y-4 pointer-events-none" : "opacity-100 translate-y-0"
      }`}
      style={{ transitionDuration: `${EXIT_DURATION_MS}ms` }}
    >
      <div className="flex flex-col items-center gap-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/products/clutch-cicks-logo.jpg"
          alt="Clutch Kicks — Stepping Correct"
          className="w-80 sm:w-[26rem] object-contain animate-logo-pulse"
        />

        {/* Walking footsteps trail */}
        <div className="flex items-center gap-2.5 h-8">
          {Array.from({ length: STEP_COUNT }).map((_, i) => (
            <Footprints
              key={i}
              className={`w-6 h-6 text-ink ${
                i % 2 === 0 ? "scale-x-[-1]" : ""
              } ${stepsStarted ? "animate-step-in" : "opacity-0"}`}
              style={
                stepsStarted
                  ? { animationDelay: `${i * STEP_STAGGER_MS}ms` }
                  : undefined
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
};
