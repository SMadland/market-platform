import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Code, Zap, Shield, ArrowLeft, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

export const Business = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscription = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-business-subscription', {
        body: { 
          priceId: 'pilot_customer', // For now, free pilot program
          returnUrl: window.location.href
        }
      });

      if (error) throw error;

      if (data.url) {
        window.open(data.url, '_blank');
      } else {
        // For free pilot, just show success message
        toast({
          title: "Velkommen som pilotkunde!",
          description: "Du er nå registrert i vårt pilotprogram. Vi kontakter deg snart med API-detaljer.",
        });
      }
    } catch (error) {
      console.error('Subscription error:', error);
      toast({
        title: "Feil",
        description: "Kunne ikke registrere deg. Prøv igjen eller kontakt oss.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Tilbake
          </Button>
          
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">M</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Mamon Business
            </span>
          </div>
          
          <Button onClick={() => navigate('/auth')} className="bg-gradient-to-r from-primary to-primary/90">
            Logg inn
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Badge className="mb-4 bg-accent/10 text-accent border-accent/20">
            Pilotkunde-program
          </Badge>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Koble din nettbutikk til Mamon
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            La kundene dele kjøpene sine automatisk og øk engasjementet gjennom sosiale anbefalinger
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-muted/20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Hvorfor velge Mamon API?
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6 text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Enkel integrasjon</h3>
              <p className="text-sm text-muted-foreground">
                Ett API-kall for å dele kjøp direkte fra checkout
              </p>
            </Card>

            <Card className="p-6 text-center">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <Shield className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-semibold mb-2">Sikker data</h3>
              <p className="text-sm text-muted-foreground">
                GDPR-kompatibel og sikker håndtering av kundedata
              </p>
            </Card>

            <Card className="p-6 text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <Code className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Utvikler-vennlig</h3>
              <p className="text-sm text-muted-foreground">
                Komplett dokumentasjon og kodeeksempler
              </p>
            </Card>

            <Card className="p-6 text-center">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <CheckCircle className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-semibold mb-2">24/7 Support</h3>
              <p className="text-sm text-muted-foreground">
                Teknisk support og integrasjonshjelp
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* API Documentation Preview */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">
            Slik fungerer integrasjonen
          </h2>
          
          <Card className="p-6 mb-8">
            <h3 className="text-xl font-semibold mb-4">API Endpoint</h3>
            <div className="bg-muted p-4 rounded-lg font-mono text-sm">
              POST https://azmrpbfifkznhqbyftsg.supabase.co/functions/v1/create-tip-from-purchase
            </div>
          </Card>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Enkelt eksempel</h3>
              <div className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                <pre>{`fetch('/api/mamon', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    user_id: customer.id,
    product_url: product.url,
    product_name: product.name,
    product_price: product.price
  })
})`}</pre>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Hva skjer så?</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  Produktinfo hentes automatisk
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  Tip opprettes i kundens feed
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  Venner får anbefalingen
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  Økt sosial trafikkk til din butikk
                </li>
              </ul>
            </Card>
          </div>

          <Card className="p-6 text-center bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
            <h3 className="text-lg font-semibold mb-2">Komplett dokumentasjon</h3>
            <p className="text-muted-foreground mb-4">
              Få tilgang til fullstendig API-dokumentasjon med kodeeksempler for alle populære plattformer
            </p>
            <Button variant="outline" className="gap-2">
              Les dokumentasjonen
              <ExternalLink className="w-4 h-4" />
            </Button>
          </Card>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4 bg-muted/20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8">
            Pilotkunde-tilbud
          </h2>
          
          <Card className="p-8 max-w-md mx-auto bg-gradient-to-br from-card to-accent/5 border-accent/20">
            <Badge className="mb-4 bg-accent/10 text-accent border-accent/20">
              Begrenset tid
            </Badge>
            
            <div className="text-center mb-6">
              <div className="text-4xl font-bold mb-2">Gratis</div>
              <div className="text-muted-foreground">under pilotperioden</div>
            </div>
            
            <ul className="space-y-3 mb-8 text-left">
              <li className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                <span>Full API-tilgang</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                <span>Prioritert teknisk support</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                <span>Integrasjonshjelp</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                <span>Ubegrenset bruk</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                <span>Påvirk produktutvikling</span>
              </li>
            </ul>
            
            <Button 
              onClick={handleSubscription}
              disabled={isLoading}
              className="w-full py-6 text-lg bg-gradient-to-r from-accent to-accent/90"
            >
              {isLoading ? 'Registrerer...' : 'Bli pilotkunde nå'}
            </Button>
          </Card>
          
          <p className="text-sm text-muted-foreground mt-6 max-w-md mx-auto">
            Ingen binding. Ingen skjulte kostnader. Vi kontakter deg innen 24 timer med API-nøkler og dokumentasjon.
          </p>
        </div>
      </section>
    </div>
  );
};