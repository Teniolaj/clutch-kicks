import React from "react";

export const MarkerCross: React.FC<{ className?: string }> = ({ className = "" }) => (
  <svg
    aria-hidden="true"
    viewBox="0 0 60 60"
    fill="none"
    className={`pointer-events-none ${className}`}
    style={{ stroke: "var(--ck-volt)" }}
  >
    <path d="M6 6L54 54" strokeWidth="3" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
    <path d="M54 8L5 53" strokeWidth="3" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
  </svg>
);
