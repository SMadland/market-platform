import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useGroups } from "@/hooks/useGroups";
import { useFriends } from "@/hooks/useFriends";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Plus, Users, MessageSquare, Loader2, Search, User } from "lucide-react";

const Messages = () => {
  const { user } = useAuth();
  const { groups, loading: groupsLoading, createGroupWithMembers } = useGroups();
  const { friends, searchUsers, getUserById } = useFriends();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showDirectMessage, setShowDirectMessage] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [dmSearchTerm, setDmSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [dmSearchResults, setDmSearchResults] = useState<any[]>([]);
  const [isCreating, setIsCreating] = useState(false);

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

  // Search for direct message users
  useEffect(() => {
    const performDmSearch = async () => {
      if (dmSearchTerm.trim().length > 1) {
        const results = await searchUsers(dmSearchTerm);
        setDmSearchResults(results);
      } else {
        setDmSearchResults([]);
      }
    };

    const timeoutId = setTimeout(performDmSearch, 300);
    return () => clearTimeout(timeoutId);
  }, [dmSearchTerm, searchUsers]);

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      toast({
        title: "Feil",
        description: "Gruppenavn er påkrevd",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    try {
      const group = await createGroupWithMembers(
        groupName.trim(),
        groupDescription.trim() || undefined,
        selectedFriends
      );
      
      if (group) {
        toast({
          title: "Gruppe opprettet",
          description: `Gruppen "${groupName}" ble opprettet!`,
        });
        
        // Reset form
        setGroupName("");
        setGroupDescription("");
        setSelectedFriends([]);
        setShowCreateGroup(false);
        
        // Navigate to the new group
        navigate(`/messages/${group.id}`);
      }
    } catch (error) {
      console.error("Error creating group:", error);
      toast({
        title: "Feil",
        description: "Kunne ikke opprette gruppe. Prøv igjen.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleStartDirectMessage = async (userId: string) => {
    if (!user) return;

    try {
      // Get user info
      const targetUser = await getUserById(userId);
      if (!targetUser) {
        toast({
          title: "Feil",
          description: "Kunne ikke finne bruker.",
          variant: "destructive",
        });
        return;
      }

      // Create a direct message group with just the two users
      const groupName = `${user.email?.split('@')[0]} & ${targetUser.display_name || targetUser.username}`;
      const group = await createGroupWithMembers(groupName, "Direktemelding", [userId]);
      
      if (group) {
        setShowDirectMessage(false);
        navigate(`/messages/${group.id}`);
      }
    } catch (error) {
      console.error("Error starting direct message:", error);
    }
  };

  const toggleFriendSelection = (friendId: string) => {
    setSelectedFriends(prev => 
      prev.includes(friendId) 
        ? prev.filter(id => id !== friendId)
        : [...prev, friendId]
    );
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
            Meldinger
          </h1>
          
          <div className="flex gap-2">
            <Dialog open={showDirectMessage} onOpenChange={setShowDirectMessage}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Direktemelding
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Start direktemelding</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Søk etter person</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        placeholder="Søk etter brukernavn eller navn..."
                        value={dmSearchTerm}
                        onChange={(e) => setDmSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    
                    {/* Search results */}
                    {dmSearchResults.length > 0 && (
                      <div className="max-h-48 overflow-y-auto border rounded-md p-2 space-y-1">
                        {dmSearchResults.map((user) => (
                          <div
                            key={user.id}
                            className="flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-muted"
                            onClick={() => handleStartDirectMessage(user.id)}
                          >
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={user.avatar_url} />
                              <AvatarFallback className="text-xs">
                                {(user.display_name || user.username || '?')[0].toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <span className="text-sm font-medium">
                                {user.display_name || user.username}
                              </span>
                              {user.display_name && user.username && (
                                <div className="text-xs text-muted-foreground">
                                  @{user.username}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {dmSearchTerm.length > 1 && dmSearchResults.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        Ingen brukere funnet
                      </p>
                    )}
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={showCreateGroup} onOpenChange={setShowCreateGroup}>
              <DialogTrigger asChild>
                <Button size="sm" className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Ny gruppe
                </Button>
              </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Opprett ny gruppe</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="groupName">Gruppenavn *</Label>
                  <Input
                    id="groupName"
                    placeholder="Skriv inn gruppenavn"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="groupDescription">Beskrivelse</Label>
                  <Textarea
                    id="groupDescription"
                    placeholder="Beskriv gruppen (valgfritt)"
                    value={groupDescription}
                    onChange={(e) => setGroupDescription(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Legg til venner</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Søk etter brukernavn eller navn..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  {/* Search results */}
                  {searchResults.length > 0 && (
                    <div className="max-h-32 overflow-y-auto border rounded-md p-2 space-y-1">
                      {searchResults.map((user) => (
                        <div
                          key={user.id}
                          className={`flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-muted ${
                            selectedFriends.includes(user.id) ? 'bg-primary/10' : ''
                          }`}
                          onClick={() => toggleFriendSelection(user.id)}
                        >
                          <Avatar className="w-6 h-6">
                            <AvatarImage src={user.avatar_url} />
                            <AvatarFallback className="text-xs">
                              {(user.display_name || user.username || '?')[0].toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">
                            {user.display_name || user.username}
                          </span>
                          {selectedFriends.includes(user.id) && (
                            <Badge variant="secondary" className="ml-auto text-xs">
                              Valgt
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {searchTerm.length > 1 && searchResults.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Ingen brukere funnet
                    </p>
                  )}

                  {/* Selected friends */}
                  {selectedFriends.length > 0 && (
                    <div className="space-y-1">
                      <Label className="text-sm text-muted-foreground">
                        Valgte medlemmer ({selectedFriends.length})
                      </Label>
                      <div className="flex flex-wrap gap-1">
                        {selectedFriends.map((friendId) => {
                          const friend = searchResults.find(u => u.id === friendId) || 
                                        friends.find(f => f.id === friendId);
                          return (
                            <Badge
                              key={friendId}
                              variant="secondary"
                              className="cursor-pointer"
                              onClick={() => toggleFriendSelection(friendId)}
                            >
                              {friend?.display_name || friend?.username || 'Ukjent'}
                              <span className="ml-1">×</span>
                            </Badge>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowCreateGroup(false)}
                    disabled={isCreating}
                  >
                    Avbryt
                  </Button>
                  <Button
                    onClick={handleCreateGroup}
                    disabled={isCreating || !groupName.trim()}
                  >
                    {isCreating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Oppretter...
                      </>
                    ) : (
                      'Opprett gruppe'
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
            </Dialog>
          </div>
          </Dialog>
        </div>
      </header>

      <div className="p-4">
        {/* Groups list */}
        <div className="space-y-4">
          {groupsLoading ? (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground">Laster grupper...</p>
            </div>
          ) : groups.length > 0 ? (
            <>
              <h2 className="text-lg font-semibold mb-4">Dine grupper</h2>
              {groups.map((group) => (
                <Card
                  key={group.id}
                  className="p-4 cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => navigate(`/messages/${group.id}`)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <Users className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{group.name}</h3>
                      {group.description && (
                        <p className="text-sm text-muted-foreground">
                          {group.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {group.member_count || 0} medlemmer
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          Opprettet {new Date(group.created_at).toLocaleDateString('no-NO')}
                        </span>
                      </div>
                    </div>
                    <MessageSquare className="w-5 h-5 text-muted-foreground" />
                  </div>
                </Card>
              ))}
            </>
          ) : (
            <div className="text-center py-12">
              <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-lg font-semibold mb-2">Ingen grupper ennå</h3>
              <p className="text-muted-foreground mb-4">
                Opprett din første gruppe for å starte å chatte med venner
              </p>
              <Button onClick={() => setShowCreateGroup(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                Opprett gruppe
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;