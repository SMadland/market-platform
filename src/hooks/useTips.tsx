import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export interface Tip {
  id: string;
  title: string;
  description: string;
  category: string | null;
  product_name: string | null;
  product_url: string | null;
  product_price: number | null;
  image_url: string | null;
  visibility: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  is_purchased: boolean | null;
  profiles?: {
    username: string | null;
    display_name: string | null;
  } | null;
}

export const useTips = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tips, setTips] = useState<Tip[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTips = async () => {
    if (!user) return;
    
    try {
      const { data: tipsData, error } = await supabase
        .from("tips")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Get profiles for each tip
      const tipsWithProfiles = await Promise.all(
        (tipsData || []).map(async (tip) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("username, display_name")
            .eq("user_id", tip.user_id)
            .single();
          
          return {
            ...tip,
            profiles: profile
          };
        })
      );

      setTips(tipsWithProfiles);
    } catch (error) {
      console.error("Error fetching tips:", error);
      toast({
        title: "Feil",
        description: "Kunne ikke laste tips. Prøv igjen.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTips();
  }, [user]);

  const refreshTips = () => {
    fetchTips();
  };

  return { tips, loading, refreshTips };
};