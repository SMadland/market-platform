import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useFriends } from "@/hooks/useFriends";
import { useConversations } from "@/hooks/useConversations";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { UserPlus, Loader2, MessageSquare, Check, X, Users, UserCheck } from "lucide-react";

const Network = () => {
  const { user } = useAuth();
  const { 
    friends, 
    friendRequests, 
    searchUsers, 
    sendFriendRequest, 
    acceptFriendRequest, 
    rejectFriendRequest, 
    loading 
  } = useFriends();
  const { createOrGetConversation } = useConversations();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (search.trim().length > 1) {
      const fetchResults = async () => {
        const found = await searchUsers(search);
        setResults(found);
      };
      fetchResults();
    } else {
      setResults([]);
    }
  }, [search, searchUsers]);

  const handleAddFriend = async (friendId: string) => {
    setActionLoading(friendId);
    try {
      const success = await sendFriendRequest(friendId);
      if (success) {
        // Update the search results to show pending status
        setResults(prev => prev.map(user => 
          user.id === friendId 
            ? { ...user, friendship_status: 'pending' }
            : user
        ));
      }
    } catch (error) {
      console.error('Error adding friend:', error);
      toast({
        title: "Feil",
        description: "Kunne ikke sende venneforespørsel.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleStartConversation = async (userId: string) => {
    setActionLoading(`chat-${userId}`);
    try {
      const conversation = await createOrGetConversation(userId);
      if (conversation) {
        navigate(`/chat/${conversation.id}`);
      }
    } catch (error) {
      console.error('Error starting conversation:', error);
      toast({
        title: "Error",
        description: "Kunne ikke starte samtale.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    setActionLoading(`accept-${requestId}`);
    try {
      await acceptFriendRequest(requestId);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    setActionLoading(`reject-${requestId}`);
    try {
      await rejectFriendRequest(requestId);
    } finally {
      setActionLoading(null);
    }
  };

  const getFriendshipButtonConfig = (friendshipStatus: string) => {
    switch (friendshipStatus) {
      case 'accepted':
        return {
          text: 'Venner',
          icon: UserCheck,
          variant: 'secondary' as const,
          disabled: true
        };
      case 'pending':
        return {
          text: 'Forespørsel sendt',
          icon: UserCheck,
          variant: 'secondary' as const,
          disabled: true
        };
      default:
        return {
          text: 'Legg til',
          icon: UserPlus,
          variant: 'default' as const,
          disabled: false
        };
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="px-4 h-16 flex items-center justify-between">
          <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Nettverk
          </h1>
        </div>
      </header>

      <div className="p-4">
        {/* Search bar */}
        <div className="mb-6">
          <Input
            placeholder="Søk etter brukere..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full"
          />
        </div>

        {/* Search results */}
        {results.length > 0 && (
          <Card className="p-4 mb-6">
            <h2 className="text-lg font-semibold mb-4">Søkeresultater</h2>
            <div className="space-y-3">
              {results.map((result) => {
                const buttonConfig = getFriendshipButtonConfig(result.friendship_status);
                const ButtonIcon = buttonConfig.icon;
                
                return (
                  <div
                    key={result.id}
                    className="flex justify-between items-center p-3 border rounded-lg hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={result.avatar_url} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {(result.display_name || result.username || 'U')[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">
                          {result.display_name || result.username || 'Ukjent bruker'}
                        </div>
                        {result.display_name && result.username && (
                          <div className="text-sm text-muted-foreground">
                            @{result.username}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStartConversation(result.id)}
                        disabled={actionLoading === `chat-${result.id}`}
                      >
                        {actionLoading === `chat-${result.id}` ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <MessageSquare className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant={buttonConfig.variant}
                        onClick={() => handleAddFriend(result.id)}
                        disabled={buttonConfig.disabled || actionLoading === result.id}
                      >
                        {actionLoading === result.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <ButtonIcon className="w-4 h-4 mr-1" />
                        )}
                        {buttonConfig.text}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {/* Content Tabs */}
        <Tabs defaultValue="friends" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="friends" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Venner ({friends.length})
            </TabsTrigger>
            <TabsTrigger value="requests" className="flex items-center gap-2">
              <UserPlus className="w-4 h-4" />
              Forespørsler ({friendRequests.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="friends" className="mt-6">
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
                  <p className="text-muted-foreground">Laster venner...</p>
                </div>
              ) : friends.length > 0 ? (
                friends.map((friend) => (
                  <Card key={friend.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={friend.avatar_url} />
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {(friend.display_name || friend.username || '?')[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">
                            {friend.display_name || friend.username}
                          </div>
                          {friend.display_name && friend.username && (
                            <div className="text-sm text-muted-foreground">
                              @{friend.username}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleStartConversation(friend.user_id)}
                          disabled={actionLoading === `chat-${friend.user_id}`}
                        >
                          {actionLoading === `chat-${friend.user_id}` ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <MessageSquare className="w-4 h-4" />
                          )}
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => navigate(`/profile/${friend.user_id}`)}
                        >
                          Se profil
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                  <p className="text-muted-foreground">Du har ingen venner ennå</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Søk etter folk ovenfor for å legge til venner
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="requests" className="mt-6">
            <div className="space-y-4">
              {friendRequests.length > 0 ? (
                friendRequests.map((request) => (
                  <Card key={request.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={request.requester_profile?.avatar_url} />
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {(request.requester_profile?.display_name || request.requester_profile?.username || '?')[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">
                            {request.requester_profile?.display_name || request.requester_profile?.username}
                          </div>
                          {request.requester_profile?.display_name && request.requester_profile?.username && (
                            <div className="text-sm text-muted-foreground">
                              @{request.requester_profile.username}
                            </div>
                          )}
                          <div className="text-xs text-muted-foreground">
                            {new Date(request.created_at).toLocaleDateString('no-NO')}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleAcceptRequest(request.id)}
                          disabled={actionLoading === `accept-${request.id}`}
                          className="text-green-600 hover:text-green-700"
                        >
                          {actionLoading === `accept-${request.id}` ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Check className="w-4 h-4" />
                          )}
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleRejectRequest(request.id)}
                          disabled={actionLoading === `reject-${request.id}`}
                          className="text-red-600 hover:text-red-700"
                        >
                          {actionLoading === `reject-${request.id}` ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <X className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <div className="text-center py-12">
                  <UserPlus className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                  <p className="text-muted-foreground">Ingen venneforespørsler</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Nye forespørsler vil vises her
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Network;
              >
                <UserPlus className="w-4 h-4 mr-1" /> Add
              </Button>
            </div>
          ))}
        </Card>
      )}

      {/* Friends list */}
      <Card className="p-4 space-y-2">
        <h2 className="text-lg font-semibold">Friends</h2>
        {loading ? (
          <Loader className="animate-spin w-6 h-6" />
        ) : friends.length === 0 ? (
          <p>No friends yet. Try adding some!</p>
        ) : (
          friends.map((f) => (
            <div
              key={f.id}
              className="flex justify-between items-center p-2 border rounded-lg"
            >
              <div className="flex items-center gap-2">
                <Avatar>
                  <AvatarImage src={f.avatar} />
                  <AvatarFallback>{f.name?.[0] || "F"}</AvatarFallback>
                </Avatar>
                <span>{f.name}</span>
              </div>
              <Badge variant="secondary">Friend</Badge>
            </div>
          ))
        )}
      </Card>
    </div>
  );
};

export default Network;
