import React from "react";

interface MarkerProps {
  color?: "red" | "volt";
  className?: string;
}

export const MarkerUnderline: React.FC<MarkerProps> = ({ color = "red", className = "" }) => (
  <svg
    aria-hidden="true"
    viewBox="0 0 260 24"
    fill="none"
    preserveAspectRatio="none"
    className={`pointer-events-none ${className}`}
    style={{ stroke: color === "red" ? "var(--ck-red)" : "var(--ck-volt)" }}
  >
    <path
      d="M4 14C60 6 140 20 256 10"
      strokeWidth="4"
      strokeLinecap="round"
      vectorEffect="non-scaling-stroke"
    />
  </svg>
);
