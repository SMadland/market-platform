import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useFriends } from "@/hooks/useFriends";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search, UserPlus, UserCheck, Clock, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Network = () => {
  const { user } = useAuth();
  const { friends, searchUsers, sendFriendRequest } = useFriends();
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [sendingRequest, setSendingRequest] = useState<string | null>(null);

  const handleSearch = async (term: string) => {
    if (term.length < 2) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const results = await searchUsers(term);
      setSearchResults(results);
    } catch (error) {
      console.error("Error searching users:", error);
      toast({
        title: "Feil",
        description: "Kunne ikke søke etter brukere. Prøv igjen.",
        variant: "destructive",
      });
    } finally {
      setSearching(false);
    }
  };

  const handleSendFriendRequest = async (userId: string) => {
    setSendingRequest(userId);
    try {
      const success = await sendFriendRequest(userId);
      if (success) {
        // Update search results to reflect new status
        setSearchResults(prev => 
          prev.map(user => 
            user.id === userId 
              ? { ...user, friendship_status: 'pending' }
              : user
          )
        );
      }
    } catch (error) {
      console.error("Error sending friend request:", error);
    } finally {
      setSendingRequest(null);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleSearch(searchTerm);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const getStatusButton = (user: any) => {
    const isLoading = sendingRequest === user.id;
    
    switch (user.friendship_status) {
      case 'accepted':
        return (
          <Button variant="secondary" size="sm" disabled>
            <UserCheck className="w-4 h-4 mr-2" />
            Venner
          </Button>
        );
      case 'pending':
        return (
          <Button variant="outline" size="sm" disabled>
            <Clock className="w-4 h-4 mr-2" />
            Sendt
          </Button>
        );
      default:
        return (
          <Button 
            variant="default" 
            size="sm"
            onClick={() => handleSendFriendRequest(user.id)}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <UserPlus className="w-4 h-4 mr-2" />
            )}
            Legg til
          </Button>
        );
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background pb-20 flex items-center justify-center">
        <p className="text-muted-foreground">Du må være logget inn for å se nettverket.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="px-4 h-16 flex items-center justify-between">
          <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Nettverk
          </h1>
          <Badge variant="secondary">
            {friends.length} venner
          </Badge>
        </div>
      </header>

      <div className="p-4">
        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Søk etter personer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
          {searching && (
            <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
          )}
        </div>

        {/* Search Results */}
        <div className="space-y-4">
          {searchTerm.length >= 2 && (
            <>
              <h2 className="text-lg font-semibold">Søkeresultater</h2>
              {searchResults.length > 0 ? (
                searchResults.map((person: any) => (
                  <Card key={person.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={person.avatar_url} />
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {(person.display_name || person.username || '?')[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">
                            {person.display_name || person.username}
                          </div>
                          {person.display_name && person.username && (
                            <div className="text-sm text-muted-foreground">
                              @{person.username}
                            </div>
                          )}
                        </div>
                      </div>
                      {getStatusButton(person)}
                    </div>
                  </Card>
                ))
              ) : !searching ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Ingen personer funnet</p>
                </div>
              ) : null}
            </>
          )}

          {searchTerm.length < 2 && (
            <div className="text-center py-12">
              <Search className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-muted-foreground">Søk etter personer for å utvide nettverket ditt</p>
              <p className="text-sm text-muted-foreground mt-2">
                Skriv minst 2 tegn for å starte søket
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

export default Network;