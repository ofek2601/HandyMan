import type { Metadata } from "next";
import { Heebo, Rubik } from "next/font/google";
import "./globals.css";

const heebo = Heebo({
  variable: "--font-heebo",
  subsets: ["hebrew", "latin"],
});

const rubik = Rubik({
  variable: "--font-rubik",
  subsets: ["hebrew", "latin"],
});

export const metadata: Metadata = {
  title: "תור הנדימן - ההנדימן של השכונה",
  description: "שירותי הנדימן לשכונה - תליית תמונות, הרכבת רהיטים, תיקונים ועוד",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl" className={`${heebo.variable} ${rubik.variable}`}>
      <body className="min-h-screen bg-[#FAFAF7] text-[#1A1A1A] font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
