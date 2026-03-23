"use client";

import Image from "next/image";

const handymanName = process.env.NEXT_PUBLIC_HANDYMAN_NAME || "ההנדימן";
const handymanPhone = process.env.NEXT_PUBLIC_HANDYMAN_PHONE || "";

export function Hero() {
  const scrollToForm = () => {
    document.getElementById("request-form")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative bg-surface px-4 py-16 text-center sm:py-24 overflow-hidden">
      <div
        className="absolute inset-0 bg-no-repeat"
        style={{
          backgroundImage: "url('/hero-bg.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <div className="absolute inset-0 bg-surface/70" />
      <Image
        src="/logo-hm.png"
        alt="לוגו הנדימן"
        width={1000}
        height={300}
        className="absolute top-4 left-4 z-10 h-24 w-auto object-contain sm:h-32"
        priority
      />
      <div className="relative mx-auto max-w-2xl">
        <span className="inline-block rounded-full bg-success-light px-4 py-1.5 text-sm font-medium text-success mb-6">
          מקבלים הזמנות חדשות
        </span>
        <h1 className="font-heading text-4xl font-bold leading-tight sm:text-5xl mb-3 drop-shadow-sm">
          {handymanName}
        </h1>
        <p className="text-xl text-text-secondary sm:text-2xl mb-8">
          ההנדימן של השכונה
        </p>
        <button
          onClick={scrollToForm}
          className="inline-block rounded-[10px] bg-accent px-8 py-4 text-lg font-bold text-white shadow-sm transition-colors hover:bg-accent-dark active:bg-accent-dark min-h-[48px]"
        >
          השאירו פרטים 
        </button>
        {handymanPhone && (
          <p className="mt-6 text-text-secondary">
            או התקשרו:{" "}
            <a
              href={`tel:${handymanPhone.replace(/-/g, "")}`}
              className="font-medium text-accent hover:text-accent-dark"
            >
              {handymanPhone}
            </a>
          </p>
        )}
      </div>
    </section>
  );
}
