import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Users, Lightbulb, Heart, Shield, Zap, Globe } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">M</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Mamon
            </span>
          </div>
          
          <Button onClick={() => navigate('/auth')} className="bg-gradient-to-r from-primary to-primary/90">
            Logg inn
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
        
        <div className="relative z-10 max-w-6xl mx-auto text-center">
          <div className="mb-8">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-foreground">
              Del dine favorittopplevelser og kjøp
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
              Få tips fra venner og familie som kjenner deg best. Oppdag produkter gjennom personlige anbefalinger.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button size="lg" onClick={() => navigate('/auth')} className="px-8 py-6 text-lg group bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300">
              Kom i gang
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          {/* Feature steps */}
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-20">
            <Card className="p-6 bg-gradient-to-br from-card to-primary/5 border border-primary/20 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <Lightbulb className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Del anbefalinger</h3>
              <p className="text-muted-foreground">
                Del produkter du elsker med venner og familie gjennom enkle tips
              </p>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-card to-accent/5 border border-accent/20 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <Users className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Bygg nettverk</h3>
              <p className="text-muted-foreground">
                Koble deg til venner og få personlige anbefalinger fra folk du stoler på
              </p>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-card to-primary/5 border border-primary/20 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <Heart className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Oppdag favoritter</h3>
              <p className="text-muted-foreground">
                Finn nye produkter gjennom anbefalinger fra mennesker som kjenner din smak
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-muted/20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Hvorfor Mamon?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              En sosial plattform bygget for å dele og oppdage produkter gjennom ekte anbefalinger
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 mx-auto">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Trygg og privat</h3>
              <p className="text-muted-foreground">
                Dine data er sikre. Del kun med de du vil dele med.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mb-4 mx-auto">
                <Zap className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Enkelt å bruke</h3>
              <p className="text-muted-foreground">
                Legg til produkter med én klikk. Automatisk produktinfo og bilder.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 mx-auto">
                <Globe className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Mobil-først</h3>
              <p className="text-muted-foreground">
                Optimalisert for mobil med rask og intuitiv navigasjon.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Klar til å dele dine favoritter?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Bli med i Mamon-fellesskapet og start å dele anbefalinger i dag
          </p>
          <Button size="lg" onClick={() => navigate('/auth')} className="px-8 py-6 text-lg bg-gradient-to-r from-primary to-primary/90">
            Registrer deg gratis
          </Button>
        </div>
      </section>
    </div>
  );
};