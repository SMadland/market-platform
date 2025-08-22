import { useState } from "react";
import { useFriends } from "@/hooks/useFriends";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, UserPlus, Users, UserCheck, Loader2 } from "lucide-react";

const Network = () => {
  const { friends, searchUsers, sendFriendRequest } = useFriends();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [sendingRequests, setSendingRequests] = useState<Set<string>>(new Set());

  const handleSearch = async (term: string) => {
    setSearchTerm(term);
    if (term.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const results = await searchUsers(term);
      setSearchResults(results);
    } catch (error) {
      console.error("Error searching users:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSendFriendRequest = async (userId: string) => {
    setSendingRequests(prev => new Set(prev).add(userId));
    await sendFriendRequest(userId);
    setSendingRequests(prev => {
      const newSet = new Set(prev);
      newSet.delete(userId);
      return newSet;
    });
    
    // Refresh search results to update friendship status
    if (searchTerm.length >= 2) {
      const results = await searchUsers(searchTerm);
      setSearchResults(results);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="px-4 h-16 flex items-center">
          <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Nettverk
          </h1>
        </div>
      </header>

      <div className="p-4">
        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input 
            placeholder="Søk etter personer..." 
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10 bg-background border-border focus:border-primary"
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card className="p-4 text-center">
            <Users className="w-6 h-6 mx-auto mb-2 text-primary" />
            <div className="text-2xl font-bold">{friends.length}</div>
            <div className="text-sm text-muted-foreground">Venner</div>
          </Card>
          <Card className="p-4 text-center">
            <UserPlus className="w-6 h-6 mx-auto mb-2 text-accent" />
            <div className="text-2xl font-bold">{searchResults.filter(u => u.friendship_status === 'pending').length}</div>
            <div className="text-sm text-muted-foreground">Ventende</div>
          </Card>
        </div>

        {/* User List */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold mb-3">
            {searchTerm.length >= 2 ? "Søkeresultater" : "Søk etter personer"}
          </h2>
          
          {isSearching ? (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground">Søker...</p>
            </div>
          ) : searchResults.length > 0 ? (
            searchResults.map((user) => (
            <Card key={user.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {(user.display_name || user.username || '?')[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{user.display_name || user.username}</div>
                    {user.display_name && user.username && (
                    <div className="text-sm text-muted-foreground">@{user.username}</div>
                    )}
                  </div>
                </div>
                <Button 
                  size="sm" 
                  variant={user.friendship_status === 'accepted' ? "secondary" : user.friendship_status === 'pending' ? "outline" : "default"}
                  className={user.friendship_status === 'none' ? "bg-gradient-to-r from-primary to-primary/90" : ""}
                  disabled={sendingRequests.has(user.id) || user.friendship_status === 'pending'}
                  onClick={() => user.friendship_status === 'none' && handleSendFriendRequest(user.id)}
                >
                  {sendingRequests.has(user.id) ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sender...
                    </>
                  ) : user.friendship_status === 'accepted' ? (
                    <>
                      <UserCheck className="w-4 h-4 mr-2" />
                      Venner
                    </>
                  ) : user.friendship_status === 'pending' ? (
                    <>
                      <UserCheck className="w-4 h-4 mr-2" />
                      Sendt
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Legg til
                    </>
                  )}
                </Button>
              </div>
            </Card>
          ))}
          )) : searchTerm.length >= 2 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Ingen brukere funnet</p>
            </div>
          ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Skriv minst 2 tegn for å søke etter personer</p>
          </div>
          )}
        </div>
        )}
      </div>
    </div>
  );
};

export default Network;