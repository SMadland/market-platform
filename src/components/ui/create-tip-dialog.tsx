import { useState, ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Loader2, Link } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const categories = [
  "Teknologi", "Hjem", "Helse", "Mat", "Reise", "Økonomi", "Arbeid", "Annet"
];

interface CreateTipDialogProps {
  children?: ReactNode;
}

export const CreateTipDialog = ({ children }: CreateTipDialogProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    product_url: "",
    description: "",
    category: "",
    visibility: "friends" as "friends" | "public"
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.product_url) return;

    setLoading(true);
    try {
          // Fetch product info from URL before creating tip
          let productInfo = {
            title: "Produktanbefaling",
            image_url: null,
            product_price: null
          };

          try {
            const response = await fetch('/functions/v1/fetch-product-info', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF6bXJwYmZpZmt6bmhxYnlmdHNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNTkxODgsImV4cCI6MjA3MDczNTE4OH0.QUVT27UGijBsWHMxE8Fgfg0MPSVdFRWcqMRqjz3GTaQ'}`
              },
              body: JSON.stringify({ url: formData.product_url })
            });

            if (response.ok) {
              const data = await response.json();
              productInfo = {
                title: data.title || "Produktanbefaling",
                image_url: data.image_url,
                product_price: data.product_price
              };
            }
          } catch (error) {
            console.error("Error fetching product info:", error);
            // Continue with default values
          }

          const { error } = await supabase
            .from("tips")
            .insert({
              title: productInfo.title,
              description: formData.description,
              category: formData.category || "Annet",
              product_url: formData.product_url,
              image_url: productInfo.image_url,
              product_price: productInfo.product_price,
              product_name: productInfo.title,
              visibility: formData.visibility,
              user_id: user.id
            });

      if (error) throw error;

      toast({
        title: "Tips delt!",
        description: "Ditt tips har blitt delt med nettverket ditt.",
      });

      setFormData({
        product_url: "",
        description: "",
        category: "",
        visibility: "friends"
      });
      setOpen(false);
      
      // Refresh to show new tip
      window.location.reload();
    } catch (error) {
      console.error("Error creating tip:", error);
      toast({
        title: "Feil",
        description: "Kunne ikke dele tips. Prøv igjen.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button size="sm" className="flex items-center gap-2 bg-gradient-to-r from-primary to-primary/90">
            <Plus className="w-4 h-4" />
            Del tips
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Del et nytt tips</DialogTitle>
          <DialogDescription>
            Lim inn en produktlenke og legg til din anbefaling
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="product_url">Produktlenke *</Label>
            <div className="relative">
              <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                id="product_url"
                type="url"
                placeholder="https://example.com/produkt"
                className="pl-10"
                value={formData.product_url}
                onChange={(e) => setFormData(prev => ({ ...prev, product_url: e.target.value }))}
                required
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Vi henter automatisk produktinfo og bilde fra lenken
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Din anbefaling</Label>
            <Textarea
              id="description"
              placeholder="Hvorfor anbefaler du dette produktet?"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Kategori</Label>
            <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Velg kategori" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="visibility">Synlighet</Label>
            <Select value={formData.visibility} onValueChange={(value: "friends" | "public") => setFormData(prev => ({ ...prev, visibility: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="friends">Kun venner</SelectItem>
                <SelectItem value="public">Offentlig</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Avbryt
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !formData.product_url}
              className="bg-gradient-to-r from-primary to-primary/90"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deler...
                </>
              ) : (
                "Del tips"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};