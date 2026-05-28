import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Customer Service",
  description: "Frequently asked questions and contact information.",
}

const faqs = [
  {
    question: "How do I track my order?",
    answer:
      "Once your order has shipped, you will receive an email with a tracking number. You can use this number to track your order on the carrier's website.",
  },
  {
    question: "What is your return policy?",
    answer:
      "We accept returns within 30 days of delivery. Items must be unused, in their original packaging, and in the same condition you received them. To start a return, please contact us at the email below.",
  },
  {
    question: "How long does shipping take?",
    answer:
      "Standard shipping takes 3–5 business days. Express shipping takes 1–2 business days. International orders may take 7–14 business days depending on the destination.",
  },
  {
    question: "Can I change or cancel my order?",
    answer:
      "Orders can be changed or cancelled within 1 hour of placing them. After that, the order may already be in processing. Please contact us as soon as possible if you need to make changes.",
  },
  {
    question: "Do you ship internationally?",
    answer:
      "Yes, we ship to most countries worldwide. Shipping costs and delivery times vary by destination and will be calculated at checkout.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept all major credit and debit cards (Visa, Mastercard, American Express) as well as other payment methods available at checkout.",
  },
]

export default function CustomerServicePage() {
  return (
    <div className="content-container py-12 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-ui-fg-base mb-2">
        Customer Service
      </h1>
      <p className="text-ui-fg-subtle mb-12">
        Find answers to common questions below, or get in touch with us
        directly.
      </p>

      <section className="mb-12">
        <h2 className="text-xl font-semibold text-ui-fg-base mb-6">
          Frequently Asked Questions
        </h2>
        <div className="flex flex-col gap-6">
          {faqs.map((faq) => (
            <div key={faq.question} className="border-b border-ui-border-base pb-6">
              <h3 className="font-medium text-ui-fg-base mb-2">
                {faq.question}
              </h3>
              <p className="text-ui-fg-subtle text-sm leading-relaxed">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-ui-bg-subtle rounded-lg p-8">
        <h2 className="text-xl font-semibold text-ui-fg-base mb-2">
          Still have questions?
        </h2>
        <p className="text-ui-fg-subtle text-sm mb-6">
          Our support team is available Monday to Friday, 9am – 6pm GMT.
        </p>
        <div className="flex flex-col gap-3 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-ui-fg-subtle">Email:</span>
            <a
              href="mailto:info@aldevon.co.uk"
              className="text-ui-fg-base underline hover:text-ui-fg-subtle"
            >
              info@aldevon.co.uk
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
