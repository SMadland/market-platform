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
  const { friends, searchUsers, addFriend, loading } = useFriends();
  const { toast } = useToast();

  const [search, setSearch] = useState("");
  const [results, setResults] = useState<any[]>([]);

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
    try {
      await addFriend(friendId);
      toast({
        title: "Friend added!",
        description: "The user has been added to your network.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not add friend.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">My Network</h1>

      {/* Search bar */}
      <div className="flex gap-2">
        <Input
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Search results */}
      {results.length > 0 && (
        <Card className="p-4 space-y-2">
          <h2 className="text-lg font-semibold">Search Results</h2>
          {results.map((r) => (
            <div
              key={r.id}
              className="flex justify-between items-center p-2 border rounded-lg"
            >
              <div className="flex items-center gap-2">
                <Avatar>
                  <AvatarImage src={r.avatar} />
                  <AvatarFallback>{r.name?.[0] || "U"}</AvatarFallback>
                </Avatar>
                <span>{r.name}</span>
              </div>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => handleAddFriend(r.id)}
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
