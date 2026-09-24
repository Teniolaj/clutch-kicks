import React from "react";

export const MarkerArrow: React.FC<{ className?: string }> = ({ className = "" }) => (
  <svg
    aria-hidden="true"
    viewBox="0 0 100 80"
    fill="none"
    className={`pointer-events-none ${className}`}
    style={{ stroke: "var(--ck-volt)" }}
  >
    <path
      d="M6 8C30 10 60 30 52 62"
      strokeWidth="3"
      strokeLinecap="round"
      vectorEffect="non-scaling-stroke"
    />
    <path
      d="M34 56L52 68L60 48"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      vectorEffect="non-scaling-stroke"
    />
  </svg>
);
