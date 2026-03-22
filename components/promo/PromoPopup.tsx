"use client";

import { useEffect, useState, useCallback } from "react";

const PROMO_TOTAL = parseInt(process.env.NEXT_PUBLIC_PROMO_TOTAL_SLOTS || "0", 10);
const PROMO_PRICE = process.env.NEXT_PUBLIC_PROMO_PRICE || "200";

interface PromoData {
  remaining: number;
  total: number;
  active: boolean;
}

export function PromoPopup() {
  const [data, setData] = useState<PromoData | null>(null);
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (PROMO_TOTAL === 0) return;

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    const fetchPromise = fetch("/api/promo")
      .then((res) => res.json())
      .then((json: PromoData) => {
        if (!cancelled) setData(json);
      })
      .catch(() => {});

    const timerPromise = new Promise<void>((resolve) => {
      timer = setTimeout(resolve, 2500);
    });

    Promise.all([fetchPromise, timerPromise]).then(() => {
      if (!cancelled) setVisible(true);
    });

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);

  const close = useCallback(() => {
    setClosing(true);
    setTimeout(() => {
      setVisible(false);
      setClosing(false);
    }, 300);
  }, []);

  const handleCTA = useCallback(() => {
    close();
    setTimeout(() => {
      document.getElementById("request-form")?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  }, [close]);

  if (PROMO_TOTAL === 0 || !visible || !data) return null;

  const ended = data.remaining === 0;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 transition-opacity duration-300 ${
        closing ? "opacity-0" : "opacity-100"
      }`}
      onClick={close}
    >
      <div
        className={`relative w-[90vw] max-w-sm rounded-2xl bg-white px-6 py-8 shadow-xl text-center transition-all duration-150 ease-out ${
          closing ? "scale-95 opacity-0" : "scale-100 opacity-100"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button — top-left for RTL */}
        <button
          onClick={close}
          className="absolute top-2 left-2 flex h-12 w-12 items-center justify-center text-2xl text-gray-400 hover:text-gray-600"
          aria-label="סגירה"
        >
          ×
        </button>

        {ended ? (
          <>
            <div className="text-5xl mb-4">😔</div>
            <h2 className="font-heading text-2xl font-bold mb-3">המבצע הסתיים!</h2>
            <p className="text-text-secondary mb-2">
              כל {data.total} המקומות נתפסו.
            </p>
            <p className="text-text-secondary mb-6">
              אבל אפשר עדיין לשלוח בקשה ונחזור אליכם עם הצעת מחיר.
            </p>
            <button
              onClick={handleCTA}
              className="w-full rounded-full bg-accent px-6 py-3 font-bold text-white min-h-[48px] hover:bg-accent-dark transition-colors"
            >
              שליחת בקשה
            </button>
          </>
        ) : (
          <>
            <div className="text-5xl mb-4">🎉</div>
            <h2 className="font-heading text-2xl font-bold mb-3">מבצע השקה!</h2>
            <p className="text-text-secondary mb-4">
              {data.total} הלקוחות הראשונים מקבלים שירות במחיר מיוחד
            </p>
            <p className="font-heading text-4xl font-bold text-accent mb-4">
              ₪{PROMO_PRICE} לכל עבודה
            </p>
            <div className="mb-6">
              <span className="inline-block rounded-full bg-[#FEF3C7] px-4 py-1 text-sm font-bold text-[#92400E]">
                נשארו רק {data.remaining} מקומות!
              </span>
            </div>
            <button
              onClick={handleCTA}
              className="w-full rounded-full bg-accent px-6 py-3 font-bold text-white min-h-[48px] hover:bg-accent-dark transition-colors"
            >
              כן, אני רוצה!
            </button>
          </>
        )}
      </div>
    </div>
  );
}
