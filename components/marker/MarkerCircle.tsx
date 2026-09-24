import React from "react";

interface MarkerProps {
  color?: "red" | "volt";
  className?: string;
}

export const MarkerCircle: React.FC<MarkerProps> = ({ color = "volt", className = "" }) => (
  <svg
    aria-hidden="true"
    viewBox="0 0 220 90"
    fill="none"
    className={`pointer-events-none ${className}`}
    style={{ stroke: color === "red" ? "var(--ck-red)" : "var(--ck-volt)" }}
  >
    <path
      d="M28 55C14 40 22 16 55 9C100 -1 165 4 195 22C214 33 208 58 178 68C140 80 55 82 24 62"
      strokeWidth="3"
      strokeLinecap="round"
      vectorEffect="non-scaling-stroke"
    />
  </svg>
);
