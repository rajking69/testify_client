import Features from "@/components/landing/Features";
import HowItWorks from "@/components/landing/HowItWorks";
import Benefits from "@/components/landing/Benefits";
import PlatformHighlights from "@/components/landing/PlatformHighlights";
import FinalCTA from "@/components/landing/FinalCTA";
import TestifyHero from "@/components/landing/TestifyHero";

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text-primary)] transition-colors duration-300">
      <TestifyHero />
      <Features />
      <HowItWorks />
      <Benefits />
      <PlatformHighlights />
      <FinalCTA />
    </div>
  );
}
