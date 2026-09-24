import React from "react";

type Variant = "primary" | "invert" | "outline" | "volt" | "text";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  as?: "button";
}

const variantClasses: Record<Variant, string> = {
  primary: "bg-ink text-ink-invert border-ink hover:bg-transparent hover:text-ink",
  invert: "bg-bg text-ink border-bg hover:bg-transparent hover:text-ink-invert hover:border-ink-invert",
  outline: "bg-transparent text-ink border-line-strong hover:bg-ink hover:text-ink-invert",
  volt: "bg-volt text-ink border-volt hover:bg-transparent hover:text-volt",
  text: "bg-transparent text-ink-muted border-transparent underline underline-offset-4 hover:text-ink",
};

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  className = "",
  children,
  ...props
}) => {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 min-w-[44px] min-h-[44px] px-6 py-3 border-2 font-sans text-sm font-semibold uppercase tracking-wide transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
