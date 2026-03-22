const STEPS = [
  { number: "1", title: "מלאו את הטופס", description: "ספרו לנו מה צריך לתקן או להתקין" },
  { number: "2", title: "נחזור אליכם", description: "תוך 24 שעות ניצור קשר לתיאום" },
  { number: "3", title: "נגיע ונבצע", description: "נגיע לביתכם ונטפל בבקשה" },
];

export function HowItWorks() {
  return (
    <section className="bg-surface px-4 py-12 sm:py-16">
      <div className="mx-auto max-w-2xl">
        <h2 className="font-heading text-2xl font-bold text-center mb-8 sm:text-3xl">
          איך זה עובד?
        </h2>
        <div className="flex flex-col gap-6 sm:flex-row sm:gap-4">
          {STEPS.map((step) => (
            <div key={step.number} className="flex-1 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-accent text-white font-heading text-xl font-bold">
                {step.number}
              </div>
              <h3 className="font-heading text-lg font-bold mb-1">{step.title}</h3>
              <p className="text-sm text-text-secondary">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
