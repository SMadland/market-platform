import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { GroupMessage } from "./useGroups";

export const useGroupMessages = (groupId: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = async () => {
    if (!user || !groupId) return;
    
    try {
      const { data: messagesData, error } = await supabase
        .from("group_messages")
        .select(`
          *,
          tips(title, product_name)
        `)
        .eq("group_id", groupId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      // Get profiles for each message
      const messagesWithProfiles = await Promise.all(
        (messagesData || []).map(async (message) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("username, display_name")
            .eq("user_id", message.user_id)
            .single();
          
          return {
            ...message,
            profiles: profile
          };
        })
      );

      setMessages(messagesWithProfiles);
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast({
        title: "Feil",
        description: "Kunne ikke laste meldinger. Prøv igjen.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (message: string, tipId?: string) => {
    if (!user || !groupId) return;

    try {
      const { error } = await supabase
        .from("group_messages")
        .insert({
          group_id: groupId,
          user_id: user.id,
          message,
          tip_id: tipId || null
        });

      if (error) throw error;

      await fetchMessages();
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Feil",
        description: "Kunne ikke sende melding. Prøv igjen.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [user, groupId]);

  // Set up real-time subscription
  useEffect(() => {
    if (!groupId) return;

    const channel = supabase
      .channel(`group_messages:${groupId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'group_messages',
          filter: `group_id=eq.${groupId}`
        },
        () => {
          fetchMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [groupId]);

  return { messages, loading, sendMessage, refreshMessages: fetchMessages };
};