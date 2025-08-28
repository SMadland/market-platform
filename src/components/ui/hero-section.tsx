import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Users, Lightbulb, Heart } from "lucide-react";

export const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 py-20 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
      
      {/* Hero content */}
      <div className="relative z-10 max-w-6xl mx-auto text-center">
        <div className="mb-8">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-foreground">
            Del dine favorittopplevelser og kjøp
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            Få tips fra venner og familie som kjenner deg best
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <Button size="lg" className="px-8 py-6 text-lg group bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300">
            Logg inn
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>

        {/* Feature steps */}
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <Card className="p-6 bg-gradient-to-br from-card to-primary/5 border border-primary/20 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 mx-auto text-primary font-bold text-xl">
              1
            </div>
            <h3 className="text-lg font-semibold mb-2">Kjøp noe på nett</h3>
            <p className="text-muted-foreground">
              Gjør et kjøp hos en av våre partnere eller på nett
            </p>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-card to-accent/5 border border-accent/20 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4 mx-auto text-accent font-bold text-xl">
              2
            </div>
            <h3 className="text-lg font-semibold mb-2">Motta kvitteringen på mail</h3>
            <p className="text-muted-foreground">
              Du får en kvittering med link til Mamon for å dele kjøpet
            </p>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-card to-primary/5 border border-primary/20 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 mx-auto text-primary font-bold text-xl">
              3
            </div>
            <h3 className="text-lg font-semibold mb-2">Del med venner og familie</h3>
            <p className="text-muted-foreground">
              Klikk på linken og del anbefalingen med ditt nettverk på Mamon
            </p>
          </Card>
        </div>
      </div>
    </section>
  );
};