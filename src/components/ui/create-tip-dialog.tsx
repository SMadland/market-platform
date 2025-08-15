import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Plus, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const categories = [
  "Teknologi", "Hjem", "Helse", "Mat", "Reise", "Økonomi", "Arbeid"
];

export const CreateTipDialog = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    product_name: "",
    product_url: "",
    product_price: "",
    visibility: "friends" as "friends" | "public"
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("tips")
        .insert({
          title: formData.title,
          description: formData.description,
          category: formData.category || null,
          product_name: formData.product_name || null,
          product_url: formData.product_url || null,
          product_price: formData.product_price ? parseFloat(formData.product_price) : null,
          visibility: formData.visibility,
          user_id: user.id
        });

      if (error) throw error;

      toast({
        title: "Tips opprettet!",
        description: "Ditt tips har blitt delt med nettverket ditt.",
      });

      setFormData({
        title: "",
        description: "",
        category: "",
        product_name: "",
        product_url: "",
        product_price: "",
        visibility: "friends"
      });
      setOpen(false);
    } catch (error) {
      console.error("Error creating tip:", error);
      toast({
        title: "Feil",
        description: "Kunne ikke opprette tips. Prøv igjen.",
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
        <Button size="sm" className="flex items-center gap-2 bg-gradient-to-r from-primary to-primary/90">
          <Plus className="w-4 h-4" />
          Del anbefaling
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Del en ny anbefaling</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Tittel *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Gi anbefalingen din en beskrivende tittel..."
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Beskrivelse *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Beskriv anbefalingen din i detalj..."
              rows={4}
              required
            />
          </div>

          <div>
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="product_name">Produktnavn</Label>
              <Input
                id="product_name"
                value={formData.product_name}
                onChange={(e) => setFormData(prev => ({ ...prev, product_name: e.target.value }))}
                placeholder="Navn på produkt..."
              />
            </div>
            <div>
              <Label htmlFor="product_price">Pris (kr)</Label>
              <Input
                id="product_price"
                type="number"
                value={formData.product_price}
                onChange={(e) => setFormData(prev => ({ ...prev, product_price: e.target.value }))}
                placeholder="0"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="product_url">Produktlenke</Label>
            <Input
              id="product_url"
              type="url"
              value={formData.product_url}
              onChange={(e) => setFormData(prev => ({ ...prev, product_url: e.target.value }))}
              placeholder="https://..."
            />
          </div>

          <div>
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
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Del anbefaling
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};