import React from "react";
import { MarkerCircle } from "./MarkerCircle";

export const MarkerLabel: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = "",
}) => (
  <span className={`relative inline-flex items-center justify-center px-4 py-1 ${className}`}>
    <span className="absolute inset-0 -m-2">
      <MarkerCircle color="red" className="w-full h-full -rotate-2" />
    </span>
    <span className="relative font-marker text-red text-base sm:text-lg -rotate-1 inline-block">
      {children}
    </span>
  </span>
);
