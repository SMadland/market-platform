import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Send, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ConversationMessage {
  id: string;
  user_id: string;
  message: string;
  created_at: string;
  profiles?: {
    username: string | null;
    display_name: string | null;
    avatar_url: string | null;
  } | null;
}

interface ConversationData {
  id: string;
  participant1_id: string;
  participant2_id: string;
  other_participant?: {
    id: string;
    username: string | null;
    display_name: string | null;
    avatar_url: string | null;
  };
}

const Conversation = () => {
  const { conversationId } = useParams<{ conversationId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [conversation, setConversation] = useState<ConversationData | null>(null);
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchConversation = async () => {
    if (!conversationId || !user) return;

    try {
      // Get conversation details
      const { data: convData, error: convError } = await supabase
        .from("conversations")
        .select("*")
        .eq("id", conversationId)
        .single();

      if (convError) throw convError;

      // Check if user is part of this conversation
      if (convData.participant1_id !== user.id && convData.participant2_id !== user.id) {
        toast({
          title: "Ingen tilgang",
          description: "Du har ikke tilgang til denne samtalen.",
          variant: "destructive",
        });
        navigate("/messages");
        return;
      }

      // Get other participant info
      const otherParticipantId = convData.participant1_id === user.id 
        ? convData.participant2_id 
        : convData.participant1_id;

      const { data: otherProfile } = await supabase
        .from("profiles")
        .select("id, username, display_name, avatar_url")
        .eq("user_id", otherParticipantId)
        .single();

      setConversation({
        ...convData,
        other_participant: otherProfile ? {
          id: otherParticipantId,
          username: otherProfile.username,
          display_name: otherProfile.display_name,
          avatar_url: otherProfile.avatar_url,
        } : undefined
      });
    } catch (error) {
      console.error("Error fetching conversation:", error);
      toast({
        title: "Feil",
        description: "Kunne ikke laste samtale.",
        variant: "destructive",
      });
      navigate("/messages");
    }
  };

  const fetchMessages = async () => {
    if (!conversationId) return;

    try {
      const { data, error } = await supabase
        .from("conversation_messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      // Get profile data separately for each message
      if (data && data.length > 0) {
        const messagesWithProfiles = await Promise.all(
          data.map(async (message) => {
            const { data: profileData } = await supabase
              .from("profiles")
              .select("username, display_name, avatar_url")
              .eq("user_id", message.user_id)
              .single();
            
            return {
              ...message,
              profiles: profileData
            };
          })
        );
        setMessages(messagesWithProfiles);
      } else {
        setMessages([]);
      }

      if (error) throw error;
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast({
        title: "Feil",
        description: "Kunne ikke laste meldinger.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !conversationId || !user || sending) return;

    setSending(true);
    try {
      const { error } = await supabase
        .from("conversation_messages")
        .insert({
          conversation_id: conversationId,
          user_id: user.id,
          message: newMessage.trim(),
        });

      if (error) throw error;

      // Update conversation timestamp
      await supabase
        .from("conversations")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", conversationId);

      setNewMessage("");
      await fetchMessages();
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Feil",
        description: "Kunne ikke sende melding.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    if (conversationId) {
      fetchConversation();
      fetchMessages();
    }
  }, [conversationId, user]);

  // Set up real-time subscription for new messages
  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`conversation_${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'conversation_messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        () => {
          fetchMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Du må være logget inn for å se samtaler.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="px-4 h-16 flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/messages")}
            className="p-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          
          {conversation?.other_participant && (
            <>
              <Avatar className="w-10 h-10">
                <AvatarImage src={conversation.other_participant.avatar_url} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {(conversation.other_participant.display_name || conversation.other_participant.username || '?')[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="font-semibold">
                  {conversation.other_participant.display_name || conversation.other_participant.username || 'Ukjent bruker'}
                </h1>
                {conversation.other_participant.display_name && conversation.other_participant.username && (
                  <p className="text-sm text-muted-foreground">@{conversation.other_participant.username}</p>
                )}
              </div>
            </>
          )}
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Ingen meldinger ennå. Send den første!</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.user_id === user.id ? 'flex-row-reverse' : ''}`}
            >
              <Avatar className="w-8 h-8">
                <AvatarImage src={message.profiles?.avatar_url} />
                <AvatarFallback className="text-xs">
                  {(message.profiles?.display_name || message.profiles?.username || '?')[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <Card className={`max-w-[70%] p-3 ${
                message.user_id === user.id 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted'
              }`}>
                <p className="text-sm">{message.message}</p>
                <p className={`text-xs mt-1 ${
                  message.user_id === user.id 
                    ? 'text-primary-foreground/70' 
                    : 'text-muted-foreground'
                }`}>
                  {new Date(message.created_at).toLocaleTimeString('no-NO', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </Card>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message input */}
      <div className="border-t bg-background p-4">
        <form onSubmit={sendMessage} className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Skriv en melding..."
            disabled={sending}
            className="flex-1"
          />
          <Button type="submit" disabled={!newMessage.trim() || sending} size="sm">
            {sending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Conversation;