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
        <div className="container mx-auto px-4 sm:px-6 h-16 flex items-center justify-between max-w-7xl">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-primary-foreground font-bold text-sm">M</span>
            </div>
            <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Mamon
            </span>
          </div>
          
          <Button onClick={() => navigate('/auth')} size="sm" className="bg-gradient-to-r from-primary to-primary/90 text-sm sm:text-base">
            Logg inn
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative flex items-center justify-center px-4 py-16 sm:py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
        
        <div className="relative z-10 container mx-auto text-center max-w-6xl">
          <div className="mb-8 sm:mb-12">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 text-foreground px-4">
              Del dine favorittopplevelser og kjøp
            </h1>
            
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground mb-6 sm:mb-8 max-w-3xl mx-auto leading-relaxed px-4">
              Få tips fra venner og familie som kjenner deg best. Oppdag produkter gjennom personlige anbefalinger.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 sm:mb-16 px-4">
            <Button size="lg" onClick={() => navigate('/auth')} className="w-full sm:w-auto px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg group bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300">
              Kom i gang
              <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          {/* Feature steps */}
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto px-4">
            <Card className="p-4 sm:p-6 bg-gradient-to-br from-card to-primary/5 border border-primary/20 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-3 sm:mb-4 mx-auto flex-shrink-0">
                <Lightbulb className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold mb-2">Del anbefalinger</h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                Del produkter du elsker med venner og familie gjennom enkle tips
              </p>
            </Card>

            <Card className="p-4 sm:p-6 bg-gradient-to-br from-card to-accent/5 border border-accent/20 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-3 sm:mb-4 mx-auto flex-shrink-0">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-accent" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold mb-2">Bygg nettverk</h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                Koble deg til venner og få personlige anbefalinger fra folk du stoler på
              </p>
            </Card>

            <Card className="p-4 sm:p-6 bg-gradient-to-br from-card to-primary/5 border border-primary/20 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 sm:col-span-2 md:col-span-1">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-3 sm:mb-4 mx-auto flex-shrink-0">
                <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold mb-2">Oppdag favoritter</h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                Finn nye produkter gjennom anbefalinger fra mennesker som kjenner din smak
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-16 md:py-20 px-4 bg-muted/20">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 px-4">
              Hvorfor Mamon?
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
              En sosial plattform bygget for å dele og oppdage produkter gjennom ekte anbefalinger
            </p>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="text-center px-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 mx-auto flex-shrink-0">
                <Shield className="w-7 h-7 sm:w-8 sm:h-8 text-primary" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2">Trygg og privat</h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                Dine data er sikre. Del kun med de du vil dele med.
              </p>
            </div>

            <div className="text-center px-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-accent/10 rounded-full flex items-center justify-center mb-4 mx-auto flex-shrink-0">
                <Zap className="w-7 h-7 sm:w-8 sm:h-8 text-accent" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2">Enkelt å bruke</h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                Legg til produkter med én klikk. Automatisk produktinfo og bilder.
              </p>
            </div>

            <div className="text-center px-4 sm:col-span-2 md:col-span-1">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 mx-auto flex-shrink-0">
                <Globe className="w-7 h-7 sm:w-8 sm:h-8 text-primary" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2">Mobil-først</h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                Optimalisert for mobil med rask og intuitiv navigasjon.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Business Section */}
      <section className="py-12 sm:py-16 md:py-20 px-4 bg-gradient-to-r from-accent/5 to-primary/5">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 px-4">
              For bedrifter
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
              Koble din nettbutikk til Mamon og la kundene dele kjøpene sine automatisk
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 sm:gap-8 items-center">
            <div className="px-4">
              <h3 className="text-xl sm:text-2xl font-bold mb-4">Pilotkunde-pakke</h3>
              <p className="text-sm sm:text-base text-muted-foreground mb-6">
                Bli en av våre første bedriftspartnere og få tilgang til Mamon API-et for å integrere 
                kjøpsanbefalinger direkte i din nettbutikk.
              </p>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <span className="text-sm sm:text-base">API-integrasjon for automatiske kjøpstips</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <span className="text-sm sm:text-base">Økt kundeengasjement gjennom sosial deling</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <span className="text-sm sm:text-base">Detaljert dokumentasjon og support</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <span className="text-sm sm:text-base">Pilotprogram med spesialpris</span>
                </li>
              </ul>

              <Button 
                size="lg" 
                onClick={() => navigate('/business')}
                className="w-full sm:w-auto px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg bg-gradient-to-r from-accent to-accent/90"
              >
                Bli pilotkunde
              </Button>
            </div>

            <Card className="p-6 sm:p-8 bg-gradient-to-br from-card to-accent/5 border border-accent/20">
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold mb-2">Gratis</div>
                <div className="text-sm sm:text-base text-muted-foreground mb-6">under pilotperioden</div>
                
                <div className="space-y-4 text-left">
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-sm sm:text-base">API-tilgang</span>
                    <span className="text-primary">✓</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-sm sm:text-base">Teknisk support</span>
                    <span className="text-primary">✓</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-sm sm:text-base">Integrasjonshjelp</span>
                    <span className="text-primary">✓</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm sm:text-base">Ubegrenset bruk</span>
                    <span className="text-primary">✓</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 md:py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 px-4">
            Klar til å dele dine favoritter?
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground mb-6 sm:mb-8 px-4">
            Bli med i Mamon-fellesskapet og start å dele anbefalinger i dag
          </p>
          <Button size="lg" onClick={() => navigate('/auth')} className="w-full sm:w-auto px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg bg-gradient-to-r from-primary to-primary/90">
            Registrer deg gratis
          </Button>
        </div>
      </section>
    </div>
  );
};