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
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
            <Lightbulb className="w-4 h-4" />
            <span className="text-sm font-medium">Jungeltelegrafen i system</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            TipsHub
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            Del og oppdage verdifulle tips fra felleskapet. Fra hverdagshacks til ekspertkunnskap - 
            alt samlet på ett sted.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <Button size="lg" className="px-8 py-6 text-lg group bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300">
            Utforsk tips
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button variant="outline" size="lg" className="px-8 py-6 text-lg border-2 hover:bg-primary/5">
            Del ditt tips
          </Button>
        </div>

        {/* Feature cards */}
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <Card className="p-6 bg-gradient-to-br from-card to-primary/5 border border-primary/20 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 mx-auto">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Fellesskap</h3>
            <p className="text-muted-foreground">
              Bygg kunnskap sammen med andre som deler dine interesser
            </p>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-card to-accent/5 border border-accent/20 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4 mx-auto">
              <Lightbulb className="w-6 h-6 text-accent" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Kvalitetstips</h3>
            <p className="text-muted-foreground">
              Oppdage kurerte tips som faktisk gjør en forskjell i hverdagen
            </p>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-card to-primary/5 border border-primary/20 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 mx-auto">
              <Heart className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Anerkjennelse</h3>
            <p className="text-muted-foreground">
              Få takk for tips som hjelper andre - bygg opp din tipsreputasjon
            </p>
          </Card>
        </div>
      </div>
    </section>
  );
};