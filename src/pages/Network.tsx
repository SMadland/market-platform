import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useFriends } from "@/hooks/useFriends";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, Loader } from "lucide-react";

const Network = () => {
  const { user } = useAuth();
  const { friends, searchUsers, sendFriendRequest, loading } = useFriends();
  const { toast } = useToast();

  const [search, setSearch] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [sendingRequest, setSendingRequest] = useState<string | null>(null);

  useEffect(() => {
    if (search.trim().length > 1) {
      const fetchResults = async () => {
        console.log('Searching for:', search);
        const found = await searchUsers(search);
        console.log('Search results:', found);
        setResults(found);
      };
      fetchResults();
    } else {
      setResults([]);
    }
  }, [search, searchUsers]);

  const handleAddFriend = async (friendId: string) => {
    setSendingRequest(friendId);
    try {
      const success = await sendFriendRequest(friendId);
      if (success) {
      toast({
        title: "Venneforespørsel sendt!",
        description: "Venneforespørselen er sendt.",
      });
        // Update the results to show the new status
        setResults(prev => prev.map(user => 
          user.id === friendId 
            ? { ...user, friendship_status: 'pending' }
            : user
        ));
      }
    } catch (error) {
      toast({
        title: "Feil",
        description: "Kunne ikke sende venneforespørsel.",
        variant: "destructive",
      });
    } finally {
      setSendingRequest(null);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">My Network</h1>

      {/* Search bar */}
      <div className="flex gap-2">
        <Input
          placeholder="Søk etter brukernavn eller navn..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Search results */}
      {results.length > 0 && (
        <Card className="p-4 space-y-2">
          <h2 className="text-lg font-semibold">Søkeresultater</h2>
          {results.map((r) => (
            <div
              key={r.id}
              className="flex justify-between items-center p-2 border rounded-lg"
            >
              <div className="flex items-center gap-2">
                <Avatar>
                  <AvatarImage src={r.avatar_url} />
                  <AvatarFallback>
                    {(r.display_name || r.username || "U")[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">
                    {r.display_name || r.username}
                  </div>
                  {r.display_name && r.username && (
                    <div className="text-sm text-muted-foreground">
                      @{r.username}
                    </div>
                  )}
                </div>
              </div>
              <Button
                size="sm"
                variant={r.friendship_status === 'pending' ? "outline" : "secondary"}
                onClick={() => handleAddFriend(r.id)}
                disabled={r.friendship_status !== 'none' || sendingRequest === r.id}
              >
                <UserPlus className="w-4 h-4 mr-1" />
                {r.friendship_status === 'pending' ? 'Sendt' : 
                 r.friendship_status === 'accepted' ? 'Venner' : 'Legg til'}
              </Button>
            </div>
          ))}
        </Card>
      )}

      {search.length > 1 && results.length === 0 && (
        <Card className="p-4 text-center">
          <p className="text-muted-foreground">Ingen brukere funnet for "{search}"</p>
        </Card>
      )}

      {/* Friends list */}
      <Card className="p-4 space-y-2">
        <h2 className="text-lg font-semibold">Venner</h2>
        {loading ? (
          <Loader className="animate-spin w-6 h-6" />
        ) : friends.length === 0 ? (
          <p>Ingen venner ennå. Prøv å legge til noen!</p>
        ) : (
          friends.map((f) => (
            <div
              key={f.user_id}
              className="flex justify-between items-center p-2 border rounded-lg"
            >
              <div className="flex items-center gap-2">
                <Avatar>
                  <AvatarImage src={f.avatar_url} />
                  <AvatarFallback>
                    {(f.display_name || f.username || "F")[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">
                    {f.display_name || f.username}
                  </div>
                  {f.display_name && f.username && (
                    <div className="text-sm text-muted-foreground">
                      @{f.username}
                    </div>
                  )}
                </div>
              </div>
              <Badge variant="secondary">Venn</Badge>
            </div>
          ))
        )}
      </Card>
    </div>
  );
};

export default Network;
