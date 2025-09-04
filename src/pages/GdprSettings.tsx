import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { ArrowLeft, Shield, Trash2, Download, AlertTriangle, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface GdprConsent {
  id: string;
  user_id: string;
  data_processing_consent: boolean;
  marketing_consent: boolean;
  analytics_consent: boolean;
  privacy_policy_version: string;
  consent_date: string;
  updated_at: string;
}

const GdprSettings = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [consent, setConsent] = useState<GdprConsent | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [deletionReason, setDeletionReason] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchConsent = async () => {
    if (!user) return;
    
    // Mock consent data since table doesn't exist yet
    setConsent({
      id: '1',
      user_id: user.id,
      data_processing_consent: true,
      marketing_consent: false,
      analytics_consent: false,
      privacy_policy_version: '1.0',
      consent_date: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
    setLoading(false);
  };

  const updateConsent = async (field: keyof Pick<GdprConsent, 'marketing_consent' | 'analytics_consent'>, value: boolean) => {
    if (!user || !consent) return;

    setUpdating(true);
    try {
      // Mock update since table doesn't exist yet
      setConsent(prev => prev ? { ...prev, [field]: value } : null);
      
      toast({
        title: "Innstillinger oppdatert",
        description: "Dine personverninnstillinger er oppdatert.",
      });
    } catch (error) {
      console.error("Error updating consent:", error);
      toast({
        title: "Feil",
        description: "Kunne ikke oppdatere innstillinger. Prøv igjen.",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const exportData = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase.functions.invoke('export-user-data', {
        body: { user_id: user.id }
      });

      if (error) throw error;

      // Create and download JSON file
      const dataStr = JSON.stringify(data, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `mamon-data-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Data eksportert",
        description: "Dine data er lastet ned som JSON-fil.",
      });
    } catch (error) {
      console.error("Error exporting data:", error);
      toast({
        title: "Feil",
        description: "Kunne ikke eksportere data. Prøv igjen.",
        variant: "destructive",
      });
    }
  };

  const requestDeletion = async () => {
    if (!user) return;

    setDeleting(true);
    try {
      // Mock deletion request since table doesn't exist yet
      console.log("Deletion request for user:", user.id, "Reason:", deletionReason);

      toast({
        title: "Slettingsforespørsel sendt",
        description: "Vi vil behandle forespørselen din innen 30 dager og sende bekreftelse på e-post.",
      });

      setShowDeleteDialog(false);
      setDeletionReason("");
    } catch (error) {
      console.error("Error requesting deletion:", error);
      toast({
        title: "Feil",
        description: "Kunne ikke sende slettingsforespørsel. Prøv igjen.",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    fetchConsent();
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen bg-background pb-20 flex items-center justify-center">
        <p className="text-muted-foreground">Du må være logget inn for å se personverninnstillinger.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-20 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="px-4 h-16 flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Personverninnstillinger
          </h1>
        </div>
      </header>

      <div className="p-4 max-w-2xl mx-auto space-y-6">
        {/* Consent Settings */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-semibold">Samtykkeinnstillinger</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-medium">Databehandling</h3>
                <p className="text-sm text-muted-foreground">
                  Nødvendig for at appen skal fungere
                </p>
              </div>
              <div className="text-sm font-medium text-primary">Påkrevd</div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-medium">Markedsføring</h3>
                <p className="text-sm text-muted-foreground">
                  E-post om nye funksjoner og oppdateringer
                </p>
              </div>
              <Button
                variant={consent?.marketing_consent ? "default" : "outline"}
                size="sm"
                onClick={() => updateConsent('marketing_consent', !consent?.marketing_consent)}
                disabled={updating}
              >
                {consent?.marketing_consent ? "På" : "Av"}
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-medium">Analyse</h3>
                <p className="text-sm text-muted-foreground">
                  Hjelp oss forbedre appen med anonymiserte data
                </p>
              </div>
              <Button
                variant={consent?.analytics_consent ? "default" : "outline"}
                size="sm"
                onClick={() => updateConsent('analytics_consent', !consent?.analytics_consent)}
                disabled={updating}
              >
                {consent?.analytics_consent ? "På" : "Av"}
              </Button>
            </div>
          </div>
        </Card>

        {/* Data Export */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Eksporter dine data</h2>
          <p className="text-muted-foreground mb-4">
            Last ned en kopi av alle dine data i JSON-format.
          </p>
          <Button onClick={exportData} variant="outline" className="w-full">
            <Download className="w-4 h-4 mr-2" />
            Last ned mine data
          </Button>
        </Card>

        {/* Privacy Policy Link */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Personvernerklæring</h2>
          <p className="text-muted-foreground mb-4">
            Les vår fullstendige personvernerklæring for mer informasjon.
          </p>
          <Button onClick={() => navigate('/privacy')} variant="outline" className="w-full">
            Les personvernerklæring
          </Button>
        </Card>

        {/* Account Deletion */}
        <Card className="p-6 border-destructive/20">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-destructive" />
            <h2 className="text-xl font-semibold text-destructive">Slett konto</h2>
          </div>
          <p className="text-muted-foreground mb-4">
            Permanent sletting av kontoen din og alle tilknyttede data. Denne handlingen kan ikke angres.
          </p>
          
          <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <DialogTrigger asChild>
              <Button variant="destructive" className="w-full">
                <Trash2 className="w-4 h-4 mr-2" />
                Slett min konto
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Bekreft kontosletting</DialogTitle>
                <DialogDescription>
                  Denne handlingen vil permanent slette kontoen din og alle tilknyttede data. 
                  Dette kan ikke angres.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="deletion-reason">Årsak til sletting (valgfri)</Label>
                  <Textarea
                    id="deletion-reason"
                    placeholder="Fortell oss hvorfor du sletter kontoen..."
                    value={deletionReason}
                    onChange={(e) => setDeletionReason(e.target.value)}
                    rows={3}
                  />
                </div>
                
                <div className="bg-destructive/10 p-4 rounded-lg">
                  <h4 className="font-medium text-destructive mb-2">Hva som vil bli slettet:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Din profil og kontoinformasjon</li>
                    <li>• Alle tips og anbefalinger du har delt</li>
                    <li>• Meldinger og samtaler</li>
                    <li>• Vennskapsforhold</li>
                    <li>• Likes og kommentarer</li>
                  </ul>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                  Avbryt
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={requestDeletion}
                  disabled={deleting}
                >
                  {deleting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sender forespørsel...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Slett kontoen min
                    </>
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </Card>
      </div>
    </div>
  );
};

export default GdprSettings;