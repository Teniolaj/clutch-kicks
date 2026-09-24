import React from "react";

export const MarkerCrown: React.FC<{ className?: string }> = ({ className = "" }) => (
  <svg
    aria-hidden="true"
    viewBox="0 0 90 60"
    fill="none"
    className={`pointer-events-none ${className}`}
    style={{ stroke: "var(--ck-volt)" }}
  >
    <path
      d="M8 50L4 20L26 34L44 8L63 35L84 19L79 50Z"
      strokeWidth="3"
      strokeLinejoin="round"
      strokeLinecap="round"
      vectorEffect="non-scaling-stroke"
    />
  </svg>
);
