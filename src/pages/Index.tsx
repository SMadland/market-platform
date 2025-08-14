import { Header } from "@/components/ui/header";
import { HeroSection } from "@/components/ui/hero-section";
import { TipsFeed } from "@/components/ui/tips-feed";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <TipsFeed />
      </main>
    </div>
  );
};

export default Index;
