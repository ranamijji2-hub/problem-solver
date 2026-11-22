import { Hero } from "@/components/home/Hero";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { PopularTools } from "@/components/home/PopularTools";
import { TrustSection } from "@/components/home/TrustSection";

export default function HomePage() {
  return (
    <main>
      <Hero />
      <CategoryGrid />
      <PopularTools />
      <TrustSection />
    </main>
  );
}
