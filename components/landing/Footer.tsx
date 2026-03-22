const handymanPhone = process.env.NEXT_PUBLIC_HANDYMAN_PHONE || "";

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface px-4 py-8 text-center">
      <p className="text-text-secondary mb-2">מעדיפים להתקשר?</p>
      {handymanPhone && (
        <a
          href={`tel:${handymanPhone.replace(/-/g, "")}`}
          className="inline-block text-xl font-bold text-accent hover:text-accent-dark min-h-[48px] leading-[48px]"
        >
          {handymanPhone}
        </a>
      )}
    </footer>
  );
}
