import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useFriends } from "@/hooks/useFriends";
import { useConversations } from "@/hooks/useConversations";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, UserPlus, MessageCircle, Users, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Network = () => {
  const { user } = useAuth();
  const { friends, friendRequests, sendFriendRequest, acceptFriendRequest, declineFriendRequest, searchUsers, loading } = useFriends();
  const { createOrGetConversation } = useConversations();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    try {
      const results = await searchUsers(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error("Search error:", error);
      toast({
        title: "Feil",
        description: "Kunne ikke søke etter brukere.",
        variant: "destructive",
      });
    } finally {
      setSearchLoading(false);
    }
  };

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (searchQuery.length >= 2) {
        handleSearch();
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(delayedSearch);
  }, [searchQuery]);

  const handleSendFriendRequest = async (userId: string) => {
    try {
      await sendFriendRequest(userId);
      toast({
        title: "Venneforespørsel sendt",
        description: "Venneforespørselen ble sendt.",
      });
      // Update search results to reflect new status
      setSearchResults(prev => prev.map(user => 
        user.id === userId ? { ...user, friendship_status: 'pending' } : user
      ));
    } catch (error) {
      console.error("Error sending friend request:", error);
      toast({
        title: "Feil",
        description: "Kunne ikke sende venneforespørsel.",
        variant: "destructive",
      });
    }
  };

  const handleStartConversation = async (userId: string) => {
    try {
      const conversation = await createOrGetConversation(userId);
      if (conversation) {
        navigate(`/conversation/${conversation.id}`);
      }
    } catch (error) {
      console.error("Error creating conversation:", error);
      toast({
        title: "Feil",
        description: "Kunne ikke starte samtale.",
        variant: "destructive",
      });
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      await acceptFriendRequest(requestId);
      toast({
        title: "Venneforespørsel godtatt",
        description: "Dere er nå venner!",
      });
    } catch (error) {
      toast({
        title: "Feil",
        description: "Kunne ikke godta venneforespørsel.",
        variant: "destructive",
      });
    }
  };

  const handleDeclineRequest = async (requestId: string) => {
    try {
      await declineFriendRequest(requestId);
      toast({
        title: "Venneforespørsel avslått",
        description: "Forespørselen ble avslått.",
      });
    } catch (error) {
      toast({
        title: "Feil",
        description: "Kunne ikke avslå venneforespørsel.",
        variant: "destructive",
      });
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Du må være logget inn for å se nettverket.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center">
          <h1 className="text-xl font-semibold">Nettverk</h1>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <Tabs defaultValue="search" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="search" className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              Søk
            </TabsTrigger>
            <TabsTrigger value="friends" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Venner ({friends.length})
            </TabsTrigger>
            <TabsTrigger value="requests" className="flex items-center gap-2">
              <UserPlus className="w-4 h-4" />
              Forespørsler ({friendRequests.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Søk etter brukere..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {searchLoading && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Søker...</p>
              </div>
            )}

            {searchResults.length > 0 && (
              <div className="space-y-3">
                {searchResults.map((user) => (
                  <Card key={user.id} className="p-4">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback>{user.name?.[0]?.toUpperCase() || '?'}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="font-medium">{user.name}</h3>
                        <p className="text-sm text-muted-foreground">@{user.username}</p>
                      </div>
                      <div className="flex gap-2">
                        {user.friendship_status === 'none' && (
                          <Button
                            size="sm"
                            onClick={() => handleSendFriendRequest(user.id)}
                          >
                            <UserPlus className="w-4 h-4 mr-1" />
                            Legg til
                          </Button>
                        )}
                        {user.friendship_status === 'pending' && (
                          <Badge variant="secondary">Venter</Badge>
                        )}
                        {user.friendship_status === 'accepted' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStartConversation(user.id)}
                          >
                            <MessageCircle className="w-4 h-4 mr-1" />
                            Chat
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {searchQuery.length >= 2 && searchResults.length === 0 && !searchLoading && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Ingen brukere funnet.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="friends" className="space-y-4">
            {friends.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Du har ingen venner ennå.</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Søk etter brukere og send venneforespørsler.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {friends.map((friend) => (
                  <Card key={friend.id} className="p-4">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={friend.avatar} />
                        <AvatarFallback>{friend.name?.[0]?.toUpperCase() || '?'}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="font-medium">{friend.name}</h3>
                        <p className="text-sm text-muted-foreground">@{friend.username}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStartConversation(friend.id)}
                      >
                        <MessageCircle className="w-4 h-4 mr-1" />
                        Chat
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="requests" className="space-y-4">
            {friendRequests.length === 0 ? (
              <div className="text-center py-8">
                <UserPlus className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Ingen ventende forespørsler.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {friendRequests.map((request) => (
                  <Card key={request.id} className="p-4">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={request.avatar} />
                        <AvatarFallback>{request.name?.[0]?.toUpperCase() || '?'}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="font-medium">{request.name}</h3>
                        <p className="text-sm text-muted-foreground">@{request.username}</p>
                        <p className="text-xs text-muted-foreground">
                          Venneforespørsel
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleAcceptRequest(request.id)}
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Godta
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeclineRequest(request.id)}
                        >
                          <X className="w-4 h-4 mr-1" />
                          Avslå
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Network;