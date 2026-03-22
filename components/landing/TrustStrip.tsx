const TRUST_ITEMS = [
  { icon: "🔧", text: "ניסיון רב שנים" },
  { icon: "✓", text: "אמין ומקצועי" },
  { icon: "🏠", text: "מהשכונה שלכם" },
];

export function TrustStrip() {
  return (
    <section className="border-y border-border bg-accent-light/50 px-4 py-6">
      <div className="mx-auto flex max-w-2xl flex-wrap items-center justify-center gap-6 sm:gap-10">
        {TRUST_ITEMS.map((item) => (
          <div key={item.text} className="flex items-center gap-2 text-text-primary">
            <span className="text-xl" aria-hidden="true">{item.icon}</span>
            <span className="text-sm font-medium sm:text-base">{item.text}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
