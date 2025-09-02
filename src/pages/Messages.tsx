import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useConversations } from "@/hooks/useConversations";
import { useFriends } from "@/hooks/useFriends";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Plus, MessageSquare, Loader2, Search } from "lucide-react";

const Messages = () => {
  const { user } = useAuth();
  const { conversations, loading: conversationsLoading, createOrGetConversation } = useConversations();
  const { searchUsers } = useFriends();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [showStartConversation, setShowStartConversation] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isStarting, setIsStarting] = useState(false);

  // Search for users when search term changes
  useEffect(() => {
    const performSearch = async () => {
      if (searchTerm.trim().length > 1) {
        const results = await searchUsers(searchTerm);
        setSearchResults(results);
      } else {
        setSearchResults([]);
      }
    };

    const timeoutId = setTimeout(performSearch, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, searchUsers]);

  const handleStartConversation = async (userId: string) => {
    setIsStarting(true);
    try {
      const conversation = await createOrGetConversation(userId);
      
      if (conversation) {
        setShowStartConversation(false);
        setSearchTerm("");
        setSearchResults([]);
        
        // Navigate to the conversation
        navigate(`/chat/${conversation.id}`);
      }
    } catch (error) {
      console.error("Error starting conversation:", error);
      toast({
        title: "Feil",
        description: "Kunne ikke starte samtale. Prøv igjen.",
        variant: "destructive",
      });
    } finally {
      setIsStarting(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background pb-20 flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Du må være logget inn for å se meldinger.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="px-4 h-16 flex items-center justify-between">
          <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Samtaler
          </h1>
          
          <Dialog open={showStartConversation} onOpenChange={setShowStartConversation}>
            <DialogTrigger asChild>
              <Button size="sm" className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Ny samtale
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Start ny samtale</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Søk etter bruker</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Søk etter brukernavn..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  {/* Search results */}
                  {searchResults.length > 0 && (
                    <div className="max-h-64 overflow-y-auto border rounded-md p-2 space-y-1">
                      {searchResults.map((user) => (
                        <div
                          key={user.id}
                          className="flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-muted"
                          onClick={() => handleStartConversation(user.id)}
                        >
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={user.avatar_url} />
                            <AvatarFallback className="text-sm">
                              {(user.display_name || user.username || '?')[0].toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="font-medium">
                              {user.display_name || user.username}
                            </div>
                            {user.display_name && user.username && (
                              <div className="text-xs text-muted-foreground">
                                @{user.username}
                              </div>
                            )}
                          </div>
                          <MessageSquare className="w-4 h-4 text-muted-foreground" />
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {searchTerm && searchResults.length === 0 && (
                    <div className="text-center py-4 text-muted-foreground">
                      Ingen brukere funnet
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowStartConversation(false)}
                    disabled={isStarting}
                  >
                    Avbryt
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <div className="p-4">
        {/* Conversations list */}
        <div className="space-y-4">
          {conversationsLoading ? (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground">Laster samtaler...</p>
            </div>
          ) : conversations.length > 0 ? (
            <>
              <h2 className="text-lg font-semibold mb-4">Dine samtaler</h2>
              {conversations.map((conversation) => (
                <Card
                  key={conversation.id}
                  className="p-4 cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => navigate(`/chat/${conversation.id}`)}
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={conversation.other_participant?.avatar_url} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {(conversation.other_participant?.display_name || conversation.other_participant?.username || '?')[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-semibold">
                        {conversation.other_participant?.display_name || conversation.other_participant?.username || 'Ukjent bruker'}
                      </h3>
                      {conversation.last_message && (
                        <p className="text-sm text-muted-foreground truncate">
                          {conversation.last_message.user_id === user?.id ? 'Du: ' : ''}
                          {conversation.last_message.message}
                        </p>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {new Date(conversation.updated_at).toLocaleDateString('no-NO')}
                      </span>
                    </div>
                    <MessageSquare className="w-5 h-5 text-muted-foreground" />
                  </div>
                </Card>
              ))}
            </>
          ) : (
            <div className="text-center py-12">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-lg font-semibold mb-2">Ingen samtaler ennå</h3>
              <p className="text-muted-foreground mb-4">
                Start din første samtale med en venn
              </p>
              <Button onClick={() => setShowStartConversation(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                Start samtale
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;