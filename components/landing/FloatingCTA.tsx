"use client";

import { useEffect, useState } from "react";

export function FloatingCTA() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const hero = document.querySelector("[data-hero]");
    const form = document.getElementById("request-form");
    if (!hero || !form) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const heroEntry = entries.find((e) => e.target === hero);
        const formEntry = entries.find((e) => e.target === form);

        if (heroEntry) {
          setVisible((prev) => (heroEntry.isIntersecting ? false : prev));
        }
        if (formEntry) {
          setVisible((prev) => (formEntry.isIntersecting ? false : prev));
        }

        const heroVisible = heroEntry?.isIntersecting ?? hero.getBoundingClientRect().bottom > 0;
        const formVisible = formEntry?.isIntersecting ?? false;

        setVisible(!heroVisible && !formVisible);
      },
      { threshold: 0.1 }
    );

    observer.observe(hero);
    observer.observe(form);
    return () => observer.disconnect();
  }, []);

  const scrollToForm = () => {
    document.getElementById("request-form")?.scrollIntoView({ behavior: "smooth" });
  };

  if (!visible) return null;

  return (
    <button
      onClick={scrollToForm}
      className="fixed bottom-6 start-1/2 -translate-x-1/2 z-50 rounded-full bg-accent px-6 py-3 text-white font-bold shadow-lg transition-all hover:bg-accent-dark active:bg-accent-dark min-h-[48px] animate-[fadeInUp_0.3s_ease-out]"
    >
      השאירו פרטים
    </button>
  );
}
