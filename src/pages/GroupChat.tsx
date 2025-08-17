import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGroupMessages } from "@/hooks/useGroupMessages";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Send, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const GroupChat = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { messages, loading, sendMessage } = useGroupMessages(groupId!);
  const [newMessage, setNewMessage] = useState("");
  const [groupName, setGroupName] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const fetchGroupName = async () => {
      if (!groupId) return;
      
      const { data, error } = await supabase
        .from("groups")
        .select("name")
        .eq("id", groupId)
        .single();

      if (error) {
        toast({
          title: "Feil",
          description: "Kunne ikke laste gruppe. Prøv igjen.",
          variant: "destructive",
        });
        navigate("/groups");
        return;
      }

      setGroupName(data.name);
    };

    fetchGroupName();
  }, [groupId, navigate, toast]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    setSending(true);
    await sendMessage(newMessage);
    setNewMessage("");
    setSending(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString("no-NO", {
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-20 flex items-center justify-center">
        <div className="text-muted-foreground">Laster chat...</div>
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
            onClick={() => navigate("/groups")}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            {groupName}
          </h1>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto pb-20">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-muted-foreground">
              Ingen meldinger ennå. Start en samtale!
            </div>
          </div>
        ) : (
          messages.map((message) => {
            const isOwn = message.user_id === user?.id;
            const displayName = message.profiles?.display_name || message.profiles?.username || "Ukjent bruker";
            
            return (
              <div
                key={message.id}
                className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
              >
                <Card className={`max-w-[80%] ${isOwn ? "bg-primary text-primary-foreground" : ""}`}>
                  <CardContent className="p-3">
                    {!isOwn && (
                      <div className="flex items-center gap-2 mb-1">
                        <User className="w-4 h-4" />
                        <span className="text-sm font-medium">{displayName}</span>
                      </div>
                    )}
                    
                    {message.tips && (
                      <div className="mb-2 p-2 bg-muted rounded text-sm">
                        <div className="font-medium">💡 {message.tips.title}</div>
                        {message.tips.product_name && (
                          <div className="text-muted-foreground">
                            Produkt: {message.tips.product_name}
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className="whitespace-pre-wrap">{message.message}</div>
                    <div className={`text-xs mt-1 ${isOwn ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                      {formatTime(message.created_at)}
                    </div>
                  </CardContent>
                </Card>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="fixed bottom-16 left-0 right-0 bg-background border-t p-4">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Skriv en melding..."
            disabled={sending}
          />
          <Button
            onClick={handleSendMessage}
            disabled={sending || !newMessage.trim()}
            size="sm"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GroupChat;