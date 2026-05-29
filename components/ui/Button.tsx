import { ButtonHTMLAttributes } from "react";

type Variant = "primario" | "secundario" | "fantasma";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  className?: string;
}

const variantClasses: Record<Variant, string> = {
  primario:
    "bg-[var(--color-laton)] text-white hover:bg-[var(--color-laton-oscuro)] " +
    "tracking-[var(--tracking-ui)] uppercase",
  secundario:
    "bg-[var(--color-coral)] text-white hover:brightness-90",
  fantasma:
    "border border-[var(--color-laton)] text-[var(--color-laton)] " +
    "hover:bg-[var(--color-laton)] hover:text-white",
};

const sizeClasses: Record<Size, string> = {
  sm: "px-[var(--space-4)] py-[var(--space-2)] text-[var(--text-xs)]",
  md: "px-[var(--space-6)] py-[var(--space-3)] text-[var(--text-sm)]",
  lg: "px-[var(--space-8)] py-[var(--space-4)] text-[var(--text-md)]",
};

export function Button({
  variant = "primario",
  size = "md",
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      className={[
        "inline-flex items-center justify-center font-[family-name:var(--font-ui)] font-medium",
        "rounded-[var(--radius-pill)] transition-all duration-150",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-laton)]",
        "disabled:opacity-60 disabled:cursor-not-allowed disabled:pointer-events-none",
        variantClasses[variant],
        sizeClasses[size],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </button>
  );
}
