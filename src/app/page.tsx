import Features from "@/components/landing/Features";
import HowItWorks from "@/components/landing/HowItWorks";
import Benefits from "@/components/landing/Benefits";
import PlatformHighlights from "@/components/landing/PlatformHighlights";
import FinalCTA from "@/components/landing/FinalCTA";

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <Features />
      <HowItWorks />
      <Benefits />
      <PlatformHighlights />
      <FinalCTA />
    </main>
  );
}
