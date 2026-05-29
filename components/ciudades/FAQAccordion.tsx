'use client'

interface FAQItem {
  question: string
  answer: string
}

interface FAQAccordionProps {
  faqs: FAQItem[]
}

export function FAQAccordion({ faqs }: FAQAccordionProps) {
  return (
    <dl className="space-y-[var(--space-3)]">
      {faqs.map((faq, index) => (
        <details
          key={index}
          className="group border border-[var(--color-arena)] rounded-[var(--radius-card)] overflow-hidden transition-brand open:border-[var(--color-laton)]/30 open:shadow-sm"
        >
          <summary
            className="
              flex items-center justify-between gap-[var(--space-4)]
              px-[var(--space-6)] py-[var(--space-4)]
              font-[family-name:var(--font-ui)] font-medium
              text-[var(--text-sm)] text-[var(--color-granito)]
              cursor-pointer list-none
              hover:bg-[var(--color-niebla)] transition-colors duration-150
              focus-visible:outline-2 focus-visible:outline-[var(--color-laton)]
            "
          >
            <dt>{faq.question}</dt>
            <span
              aria-hidden="true"
              className="shrink-0 text-[var(--color-laton)] transition-transform duration-200 group-open:rotate-180"
            >
              ▾
            </span>
          </summary>
          <dd
            className="
              px-[var(--space-6)] pb-[var(--space-4)]
              font-[family-name:var(--font-ui)] text-[var(--text-sm)]
              text-[var(--color-pizarra)] leading-[var(--leading-cuerpo)]
              border-t border-[var(--color-arena)]
              pt-[var(--space-4)]
            "
          >
            {faq.answer}
          </dd>
        </details>
      ))}
    </dl>
  )
}
