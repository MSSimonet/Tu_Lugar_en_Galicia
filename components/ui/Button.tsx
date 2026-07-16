"use client";

import type { ComponentProps } from "react";
import { motion } from "motion/react";
import { BRAND_EASE } from "@/lib/motion/variants";

type Variant = "primario" | "secundario" | "fantasma";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends Omit<ComponentProps<typeof motion.button>, "ref"> {
  variant?: Variant;
  size?: Size;
  className?: string;
}

// Pedra e Ouro — mismos tokens que ya usa el resto del sitio en el CTA dorado
// (antes esta variante usaba --color-laton, un sistema distinto que nadie más
// usa; por eso ningún CTA real llamaba a este componente).
const variantClasses: Record<Variant, string> = {
  primario:
    "bg-[var(--po-ouro)] [color:var(--po-ouro-ink)] hover:bg-[var(--po-ouro-hover)] " +
    "tracking-[var(--tracking-ui)] uppercase",
  secundario:
    "bg-[var(--po-pedra)] [color:var(--po-luz)] hover:bg-[color-mix(in_srgb,var(--po-pedra)_85%,black)]",
  fantasma:
    "border border-[var(--po-ouro)] [color:var(--po-ouro-text)] " +
    "hover:bg-[var(--po-ouro-text)] hover:[color:var(--po-luz)]",
};

const sizeClasses: Record<Size, string> = {
  sm: "px-[var(--space-4)] py-[var(--space-2)] [font-size:var(--text-xs)]",
  md: "px-[var(--space-6)] py-[var(--space-3)] [font-size:var(--text-sm)]",
  lg: "px-[var(--space-8)] py-[var(--space-4)] [font-size:var(--text-md)]",
};

export function Button({
  variant = "primario",
  size = "md",
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <motion.button
      whileHover={{ y: -1, transition: { duration: 0.2, ease: BRAND_EASE } }}
      whileTap={{ scale: 0.98, y: 0, transition: { duration: 0.1, ease: BRAND_EASE } }}
      {...props}
      className={[
        "inline-flex items-center justify-center font-[family-name:var(--font-ui)] font-medium",
        "rounded-[var(--radius-pill)] transition-colors duration-200 ease-in-out",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--po-ouro)]",
        "disabled:opacity-60 disabled:cursor-not-allowed disabled:pointer-events-none",
        variantClasses[variant],
        sizeClasses[size],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </motion.button>
  );
}
