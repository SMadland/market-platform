import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface Tip {
  id: string;
  title: string;
  description: string;
  category: string | null;
  product_name: string | null;
  product_url: string | null;
  product_price: number | null;
  image_url: string | null;
  visibility: string;
  tip_type: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  is_purchased: boolean | null;
  profiles?: {
    username: string | null;
    display_name: string | null;
    avatar_url: string | null;
  } | null;
}

export const useTips = (tipType: 'private' | 'business' = 'private', showPublicOnly: boolean = false) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tips, setTips] = useState<Tip[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTips = async () => {
    if (!user) return;
    
    try {
      // Fetch tips with visibility filter
      let query = supabase
        .from("tips")
        .select("*")
        .eq("tip_type", tipType);
      
      if (showPublicOnly) {
        query = query.eq("visibility", "public");
      }
      
      const { data: tipsData, error } = await query;

      if (error) throw error;

      // Get profiles for each tip
      const tipsWithProfiles = await Promise.all(
        (tipsData || []).map(async (tip) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("username, display_name, avatar_url")
            .eq("user_id", tip.user_id)
            .single();
          
          return {
            ...tip,
            profiles: profile
          };
        })
      );

      // Fetch likes and comments counts
      const { data: allLikes } = await supabase
        .from("likes")
        .select("tip_id");
      
      const { data: allComments } = await supabase
        .from("comments")
        .select("tip_id");

      const likesCountMap: Record<string, number> = {};
      const commentsCountMap: Record<string, number> = {};

      allLikes?.forEach(like => {
        likesCountMap[like.tip_id] = (likesCountMap[like.tip_id] || 0) + 1;
      });

      allComments?.forEach(comment => {
        commentsCountMap[comment.tip_id] = (commentsCountMap[comment.tip_id] || 0) + 1;
      });

      // Fetch user's friendships
      const { data: friendships } = await supabase
        .from("friendships")
        .select("requester_id, addressee_id")
        .eq("status", "accepted")
        .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`);

      const friendIds = new Set<string>();
      friendships?.forEach(f => {
        const friendId = f.requester_id === user.id ? f.addressee_id : f.requester_id;
        friendIds.add(friendId);
      });

      // Calculate score for each tip and sort
      const tipsWithScores = tipsWithProfiles.map(tip => {
        const likesCount = likesCountMap[tip.id] || 0;
        const commentsCount = commentsCountMap[tip.id] || 0;
        const isFriend = friendIds.has(tip.user_id);
        const ageInDays = Math.floor((Date.now() - new Date(tip.created_at).getTime()) / (1000 * 60 * 60 * 24));

        // Calculate score
        let score = 0;
        if (isFriend) score += 1000; // Big boost for friends
        score += likesCount * 10;
        score += commentsCount * 15; // Comments are worth more
        score += Math.max(0, 7 - ageInDays) * 50; // Recency boost (last 7 days)

        return { ...tip, score };
      });

      // Sort by score
      tipsWithScores.sort((a, b) => b.score - a.score);

      setTips(tipsWithScores);
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
  }, [user, tipType]);

  const refreshTips = () => {
    fetchTips();
  };

  return { tips, loading, refreshTips };
};