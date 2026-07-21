"use client";

import { Accordion as RadixAccordion } from "radix-ui";
import { ChevronDown } from "lucide-react";

export interface AccordionItemData {
  question: string;
  answer: string;
}

interface AccordionProps {
  items: AccordionItemData[];
  className?: string;
}

// Acordeón Pedra e Ouro sobre Radix (accesible por defecto: teclado, ARIA, un solo
// panel abierto a la vez) — reemplaza el <details> nativo con altura animada real,
// usando las keyframes accordion-down/up que ya trae shadcn/tailwind.css.
export function Accordion({ items, className = "" }: AccordionProps) {
  return (
    <RadixAccordion.Root
      type="single"
      collapsible
      className={["space-y-[var(--space-3)]", className].filter(Boolean).join(" ")}
    >
      {items.map((item, index) => (
        <RadixAccordion.Item
          key={index}
          value={String(index)}
          className="overflow-hidden transition-brand"
          style={{
            border: "1px solid var(--dz-borde)",
            borderRadius: "8px",
            backgroundColor: "var(--dz-luz)",
          }}
        >
          <RadixAccordion.Header>
            <RadixAccordion.Trigger
              className="group flex w-full cursor-pointer items-center justify-between gap-[var(--space-4)] px-[var(--space-6)] py-[var(--space-4)] font-medium transition-colors duration-150 focus-visible:outline-2"
              style={{
                fontFamily: "var(--font-dz-ui)",
                fontSize: "var(--text-sm)",
                color: "var(--dz-ink)",
                outlineColor: "var(--dz-accent)",
              }}
            >
              <span className="text-left">{item.question}</span>
              <ChevronDown
                aria-hidden="true"
                size={18}
                className="shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180"
                style={{ color: "var(--dz-accent-text)" }}
              />
            </RadixAccordion.Trigger>
          </RadixAccordion.Header>
          <RadixAccordion.Content
            className="overflow-hidden data-[state=open]:animate-[accordion-down_200ms_ease-out] data-[state=closed]:animate-[accordion-up_200ms_ease-out]"
            style={{
              fontFamily: "var(--font-dz-ui)",
              fontSize: "var(--text-sm)",
              color: "var(--dz-muted)",
              borderTop: "1px solid var(--dz-borde)",
            }}
          >
            <div className="px-[var(--space-6)] pb-[var(--space-4)] pt-[var(--space-4)] leading-[var(--leading-cuerpo)]">
              {item.answer}
            </div>
          </RadixAccordion.Content>
        </RadixAccordion.Item>
      ))}
    </RadixAccordion.Root>
  );
}
