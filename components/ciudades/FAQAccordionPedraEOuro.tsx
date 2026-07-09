interface FAQItem {
  question: string
  answer: string
}

interface FAQAccordionProps {
  faqs: FAQItem[]
}

export function FAQAccordionPedraEOuro({ faqs }: FAQAccordionProps) {
  return (
    <div className="space-y-[var(--space-3)]">
      {faqs.map((faq, index) => (
        <details
          key={index}
          className="po-faq-details group overflow-hidden transition-brand"
          style={{
            border: '1px solid var(--po-borde)',
            borderRadius: '4px',
            backgroundColor: 'var(--po-luz)',
          }}
        >
          <summary
            className="po-faq-summary flex cursor-pointer list-none items-center justify-between gap-[var(--space-4)] px-[var(--space-6)] py-[var(--space-4)] font-medium transition-colors duration-150 focus-visible:outline-2"
            style={{
              fontFamily: 'var(--font-lato)',
              fontSize: 'var(--text-sm)',
              color: 'var(--po-pedra)',
              outlineColor: 'var(--po-ouro)',
            }}
          >
            <span>{faq.question}</span>
            <span
              aria-hidden="true"
              className="shrink-0 transition-transform duration-200 group-open:rotate-180"
              style={{ color: 'var(--po-ouro-text)' }}
            >
              ▾
            </span>
          </summary>
          <div
            className="px-[var(--space-6)] pb-[var(--space-4)] pt-[var(--space-4)] leading-[var(--leading-cuerpo)]"
            style={{
              fontFamily: 'var(--font-lato)',
              fontSize: 'var(--text-sm)',
              color: 'var(--po-muted)',
              borderTop: '1px solid var(--po-borde)',
            }}
          >
            {faq.answer}
          </div>
        </details>
      ))}
    </div>
  )
}
