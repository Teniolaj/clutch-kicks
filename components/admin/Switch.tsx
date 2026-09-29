"use client";

import React from "react";

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  disabled?: boolean;
}

export const Switch: React.FC<SwitchProps> = ({ checked, onChange, label, disabled }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={label}
    title={label}
    disabled={disabled}
    onClick={() => onChange(!checked)}
    className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border-2 transition-colors disabled:opacity-50 ${
      checked ? "bg-ink border-ink" : "bg-bg-sunken border-line"
    }`}
  >
    <span
      className={`inline-block h-4 w-4 rounded-full transition-transform ${
        checked ? "translate-x-[22px] bg-volt" : "translate-x-[2px] bg-bg"
      }`}
    />
  </button>
);
