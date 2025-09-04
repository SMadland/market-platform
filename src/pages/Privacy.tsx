import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Privacy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="px-4 h-16 flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Personvernerklæring
          </h1>
        </div>
      </header>

      <div className="p-4 max-w-4xl mx-auto">
        <Card className="p-6">
          <div className="prose prose-sm max-w-none">
            <h2 className="text-2xl font-bold mb-4">Personvernerklæring for Mamon</h2>
            <p className="text-muted-foreground mb-6">Sist oppdatert: {new Date().toLocaleDateString('no-NO')}</p>

            <section className="mb-8">
              <h3 className="text-lg font-semibold mb-3">1. Hvem vi er</h3>
              <p className="text-muted-foreground mb-4">
                Mamon er en sosial plattform for å dele og oppdage produktanbefalinger. Vi er forpliktet til å beskytte ditt personvern og være transparente om hvordan vi samler inn, bruker og beskytter dine personopplysninger.
              </p>
            </section>

            <section className="mb-8">
              <h3 className="text-lg font-semibold mb-3">2. Hvilke opplysninger vi samler inn</h3>
              <div className="space-y-3 text-muted-foreground">
                <div>
                  <h4 className="font-medium text-foreground">Kontoinformasjon:</h4>
                  <ul className="list-disc list-inside ml-4">
                    <li>E-postadresse</li>
                    <li>Brukernavn og visningsnavn</li>
                    <li>Profilbilde</li>
                    <li>Biografisk informasjon</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-foreground">Innhold du deler:</h4>
                  <ul className="list-disc list-inside ml-4">
                    <li>Tips og anbefalinger</li>
                    <li>Kommentarer og likes</li>
                    <li>Meldinger til andre brukere</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-foreground">Teknisk informasjon:</h4>
                  <ul className="list-disc list-inside ml-4">
                    <li>IP-adresse</li>
                    <li>Enhetstype og nettleser</li>
                    <li>Bruksmønstre i appen</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h3 className="text-lg font-semibold mb-3">3. Hvordan vi bruker opplysningene</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Levere og forbedre våre tjenester</li>
                <li>Personalisere din opplevelse</li>
                <li>Kommunisere med deg om kontoen din</li>
                <li>Sikkerhet og forebygging av misbruk</li>
                <li>Analyser for å forbedre plattformen</li>
              </ul>
            </section>

            <section className="mb-8">
              <h3 className="text-lg font-semibold mb-3">4. Deling av opplysninger</h3>
              <p className="text-muted-foreground mb-4">
                Vi selger aldri dine personopplysninger. Vi deler kun informasjon i følgende tilfeller:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Med ditt samtykke</li>
                <li>For å levere tjenester du har bedt om</li>
                <li>For å overholde juridiske forpliktelser</li>
                <li>For å beskytte våre rettigheter og sikkerhet</li>
              </ul>
            </section>

            <section className="mb-8">
              <h3 className="text-lg font-semibold mb-3">5. Dine rettigheter</h3>
              <p className="text-muted-foreground mb-4">
                I henhold til GDPR har du følgende rettigheter:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li><strong>Rett til innsyn:</strong> Se hvilke opplysninger vi har om deg</li>
                <li><strong>Rett til retting:</strong> Korrigere feil informasjon</li>
                <li><strong>Rett til sletting:</strong> Be om at vi sletter dine opplysninger</li>
                <li><strong>Rett til begrensning:</strong> Begrense hvordan vi behandler dine opplysninger</li>
                <li><strong>Rett til dataportabilitet:</strong> Få en kopi av dine data</li>
                <li><strong>Rett til å trekke tilbake samtykke:</strong> Når som helst</li>
              </ul>
            </section>

            <section className="mb-8">
              <h3 className="text-lg font-semibold mb-3">6. Datasikkerhet</h3>
              <p className="text-muted-foreground mb-4">
                Vi bruker industristandarder for å beskytte dine opplysninger, inkludert kryptering, sikre servere og regelmessige sikkerhetsoppdateringer.
              </p>
            </section>

            <section className="mb-8">
              <h3 className="text-lg font-semibold mb-3">7. Kontakt oss</h3>
              <p className="text-muted-foreground">
                Hvis du har spørsmål om denne personvernerklæringen eller ønsker å utøve dine rettigheter, kan du kontakte oss på:
              </p>
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <p className="font-medium">E-post: privacy@mamon.no</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Vi svarer på henvendelser innen 30 dager.
                </p>
              </div>
            </section>

            <div className="mt-8 pt-6 border-t">
              <Button onClick={() => navigate('/gdpr')} className="w-full">
                Administrer dine personverninnstillinger
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Privacy;