import { Hero } from "@/components/landing/Hero";
import { TrustStrip } from "@/components/landing/TrustStrip";
import { ServicesGrid } from "@/components/landing/ServicesGrid";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { RequestForm } from "@/components/landing/RequestForm";
import { Footer } from "@/components/landing/Footer";
import { FloatingCTA } from "@/components/landing/FloatingCTA";
import { PromoPopup } from "@/components/promo/PromoPopup";

export default function Home() {
  return (
    <>
      <div data-hero>
        <Hero />
      </div>
      <TrustStrip />
      <ServicesGrid />
      <HowItWorks />
      <RequestForm />
      <Footer />
      <FloatingCTA />
      <PromoPopup />
    </>
  );
}
