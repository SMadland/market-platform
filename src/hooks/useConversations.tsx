import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface Conversation {
  id: string;
  participant1_id: string;
  participant2_id: string;
  created_at: string;
  updated_at: string;
  other_participant?: {
    id: string;
    username: string | null;
    display_name: string | null;
    avatar_url: string | null;
  };
  last_message?: {
    message: string;
    created_at: string;
    user_id: string;
  };
}

interface ConversationMessage {
  id: string;
  conversation_id: string;
  user_id: string;
  message: string;
  tip_id: string | null;
  created_at: string;
  profiles?: {
    username: string | null;
    display_name: string | null;
    avatar_url: string | null;
  } | null;
  tips?: {
    title: string;
    product_name: string | null;
  } | null;
}

export const useConversations = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConversations = async () => {
    if (!user) return;
    
    try {
      // Get all conversations for this user
      const { data: conversationsData, error } = await supabase
        .from("conversations")
        .select(`
          *,
          profiles!conversations_participant1_id_fkey(id, username, display_name, avatar_url),
          profiles!conversations_participant2_id_fkey(id, username, display_name, avatar_url)
        `)
        .or(`participant1_id.eq.${user.id},participant2_id.eq.${user.id}`)
        .order("updated_at", { ascending: false });

      if (error) throw error;

      // Format conversations with other participant info
      const formattedConversations = await Promise.all(
        (conversationsData || []).map(async (conv) => {
          // Determine other participant
          const isParticipant1 = conv.participant1_id === user.id;
          const otherParticipantId = isParticipant1 ? conv.participant2_id : conv.participant1_id;
          
          // Get other participant's profile
          const { data: otherProfile } = await supabase
            .from("profiles")
            .select("id, username, display_name, avatar_url")
            .eq("user_id", otherParticipantId)
            .single();

          // Get last message
          const { data: lastMessage } = await supabase
            .from("conversation_messages")
            .select("message, created_at, user_id")
            .eq("conversation_id", conv.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .single();

          return {
            ...conv,
            other_participant: otherProfile ? {
              id: otherParticipantId,
              username: otherProfile.username,
              display_name: otherProfile.display_name,
              avatar_url: otherProfile.avatar_url,
            } : undefined,
            last_message: lastMessage
          };
        })
      );

      setConversations(formattedConversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      toast({
        title: "Feil",
        description: "Kunne ikke laste samtaler. Prøv igjen.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createOrGetConversation = async (otherUserId: string) => {
    if (!user) return null;

    try {
      // Check if conversation already exists
      const { data: existingConv } = await supabase
        .from("conversations")
        .select("*")
        .or(`and(participant1_id.eq.${user.id},participant2_id.eq.${otherUserId}),and(participant1_id.eq.${otherUserId},participant2_id.eq.${user.id})`)
        .single();

      if (existingConv) {
        return existingConv;
      }

      // Create new conversation
      const { data: newConv, error } = await supabase
        .from("conversations")
        .insert({
          participant1_id: user.id < otherUserId ? user.id : otherUserId,
          participant2_id: user.id < otherUserId ? otherUserId : user.id,
        })
        .select()
        .single();

      if (error) throw error;

      await fetchConversations();
      return newConv;
    } catch (error) {
      console.error("Error creating conversation:", error);
      toast({
        title: "Feil",
        description: "Kunne ikke starte samtale. Prøv igjen.",
        variant: "destructive",
      });
      return null;
    }
  };

  const sendMessage = async (conversationId: string, message: string, tipId?: string) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from("conversation_messages")
        .insert({
          conversation_id: conversationId,
          user_id: user.id,
          message,
          tip_id: tipId || null,
        })
        .select()
        .single();

      if (error) throw error;

      // Update conversation's updated_at
      await supabase
        .from("conversations")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", conversationId);

      await fetchConversations();
      return data;
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Feil",
        description: "Kunne ikke sende melding. Prøv igjen.",
        variant: "destructive",
      });
      return null;
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [user]);

  return { 
    conversations, 
    loading, 
    createOrGetConversation, 
    sendMessage,
    refreshConversations: fetchConversations 
  };
};