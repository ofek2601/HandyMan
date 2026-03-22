import Image from "next/image";

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 bg-surface/90 backdrop-blur-sm border-b border-border">
      <div className="mx-auto flex max-w-5xl items-center px-4 py-3">
        <Image
          src="/logo-hm.png"
          alt="לוגו הנדימן"
          width={120}
          height={48}
          className="h-10 w-auto object-contain"
          priority
        />
      </div>
    </header>
  );
}
