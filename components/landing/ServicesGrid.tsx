const SERVICES = [
  { icon: "🖼️", label: "תליית תמונות ומדפים" },
  { icon: "🪑", label: "הרכבת ארונות ורהיטים" },
  { icon: "🔨", label: "תיקונים כלליים" },
  { icon: "💡", label: "חשמל ותאורה בסיסיים" },
  { icon: "🚿", label: "אינסטלציה קלה" },
  { icon: "🏗️", label: "עבודות בית שונות" },
];

export function ServicesGrid() {
  return (
    <section className="px-4 py-12 sm:py-16">
      <div className="mx-auto max-w-2xl">
        <h2 className="font-heading text-2xl font-bold text-center mb-8 sm:text-3xl">
          השירותים שלנו
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {SERVICES.map((service) => (
            <div
              key={service.label}
              className="flex items-center gap-3 rounded-2xl bg-surface p-4 shadow-[0_2px_20px_rgba(0,0,0,0.06)] border border-border"
            >
              <span className="text-2xl flex-shrink-0" aria-hidden="true">{service.icon}</span>
              <span className="text-sm font-medium sm:text-base">{service.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
