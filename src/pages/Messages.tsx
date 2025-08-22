@@ .. @@
 import { useState } from "react";
-import { useGroups } from "@/hooks/useGroups";
+import { useGroups } from "@/hooks/useGroups";
+import { useFriends } from "@/hooks/useFriends";
 import { Button } from "@/components/ui/button";
+import { Input } from "@/components/ui/input";
 import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
+import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
+import { Checkbox } from "@/components/ui/checkbox";
 import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
-import { Input } from "@/components/ui/input";
 import { Textarea } from "@/components/ui/textarea";
 import { Label } from "@/components/ui/label";
-import { Plus, Users, MessageCircle, Search } from "lucide-react";
+import { Plus, Users, MessageCircle, Search, UserPlus } from "lucide-react";
 import { useNavigate } from "react-router-dom";
+import { useAuth } from "@/hooks/useAuth";

 const Messages = () => {
   const navigate = useNavigate();
+  const { user } = useAuth();
   const { groups, loading, createGroup } = useGroups();
+  const { friends, searchUsers, sendFriendRequest } = useFriends();
   const [searchTerm, setSearchTerm] = useState("");
   const [isCreating, setIsCreating] = useState(false);
   const [newGroupName, setNewGroupName] = useState("");
   const [newGroupDescription, setNewGroupDescription] = useState("");
   const [dialogOpen, setDialogOpen] = useState(false);
+  const [newChatDialogOpen, setNewChatDialogOpen] = useState(false);
+  const [userSearchTerm, setUserSearchTerm] = useState("");
+  const [searchResults, setSearchResults] = useState([]);
+  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
+  const [isSearching, setIsSearching] = useState(false);

   const filteredGroups = groups.filter(group =>
     group.name.toLowerCase().includes(searchTerm.toLowerCase())
   );

+  const handleUserSearch = async (term: string) => {
+    setUserSearchTerm(term);
+    if (term.length < 2) {
+      setSearchResults([]);
+      return;
+    }
+
+    setIsSearching(true);
+    try {
+      const results = await searchUsers(term);
+      setSearchResults(results);
+    } catch (error) {
+      console.error("Error searching users:", error);
+    } finally {
+      setIsSearching(false);
+    }
+  };
+
+  const handleUserSelect = (userId: string) => {
+    setSelectedUsers(prev => 
+      prev.includes(userId) 
+        ? prev.filter(id => id !== userId)
+        : [...prev, userId]
+    );
+  };
+
+  const handleStartChat = async () => {
+    if (selectedUsers.length === 0) return;
+
+    if (selectedUsers.length === 1) {
+      // Direct message - create a group with just two people
+      const otherUser = searchResults.find(u => u.id === selectedUsers[0]);
+      if (otherUser) {
+        const groupName = `${otherUser.display_name || otherUser.username}`;
+        const group = await createGroup(groupName, null, selectedUsers);
+        if (group) {
+          navigate(`/messages/${group.id}`);
+        }
+      }
+    } else {
+      // Group chat
+      const groupName = `Gruppechat (${selectedUsers.length + 1} medlemmer)`;
+      const group = await createGroup(groupName, null, selectedUsers);
+      if (group) {
+        navigate(`/messages/${group.id}`);
+      }
+    }
+
+    setSelectedUsers([]);
+    setUserSearchTerm("");
+    setSearchResults([]);
+    setNewChatDialogOpen(false);
+  };
+
   const handleCreateGroup = async () => {
     if (!newGroupName.trim()) return;

     setIsCreating(true);
-    const group = await createGroup(newGroupName, newGroupDescription);
+    const group = await createGroup(newGroupName, newGroupDescription, []);
     
     if (group) {
       setNewGroupName("");
       setNewGroupDescription("");
       setDialogOpen(false);
-      navigate(`/groups/${group.id}`);
+      navigate(`/messages/${group.id}`);
     }
     
     setIsCreating(false);
   };

@@ .. @@
           <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
             Meldinger
           </h1>
-          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
-            <DialogTrigger asChild>
-              <Button size="sm">
-                <Plus className="w-4 h-4 mr-2" />
-                Ny Gruppe
-              </Button>
-            </DialogTrigger>
-            <DialogContent>
-              <DialogHeader>
-                <DialogTitle>Opprett ny gruppe</DialogTitle>
-              </DialogHeader>
-              <div className="space-y-4">
-                <div>
-                  <Label htmlFor="group-name">Gruppenavn</Label>
-                  <Input
-                    id="group-name"
-                    value={newGroupName}
-                    onChange={(e) => setNewGroupName(e.target.value)}
-                    placeholder="Skriv inn gruppenavn..."
-                  />
-                </div>
-                <div>
-                  <Label htmlFor="group-description">Beskrivelse (valgfritt)</Label>
-                  <Textarea
-                    id="group-description"
-                    value={newGroupDescription}
-                    onChange={(e) => setNewGroupDescription(e.target.value)}
-                    placeholder="Beskriv gruppen..."
-                    rows={3}
-                  />
-                </div>
-                <Button 
-                  onClick={handleCreateGroup} 
-                  disabled={isCreating || !newGroupName.trim()}
-                  className="w-full"
-                >
-                  {isCreating ? "Oppretter..." : "Opprett Gruppe"}
-                </Button>
-              </div>
-            </DialogContent>
-          </Dialog>
+          <div className="flex gap-2">
+            <Dialog open={newChatDialogOpen} onOpenChange={setNewChatDialogOpen}>
+              <DialogTrigger asChild>
+                <Button size="sm" variant="outline">
+                  <UserPlus className="w-4 h-4 mr-2" />
+                  Ny Chat
+                </Button>
+              </DialogTrigger>
+              <DialogContent className="sm:max-w-[500px]">
+                <DialogHeader>
+                  <DialogTitle>Start ny samtale</DialogTitle>
+                </DialogHeader>
+                <div className="space-y-4">
+                  <div className="relative">
+                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
+                    <Input
+                      placeholder="Søk etter venner..."
+                      value={userSearchTerm}
+                      onChange={(e) => handleUserSearch(e.target.value)}
+                      className="pl-10"
+                    />
+                  </div>
+
+                  {selectedUsers.length > 0 && (
+                    <div className="flex flex-wrap gap-2 p-2 bg-muted rounded-lg">
+                      {selectedUsers.map(userId => {
+                        const user = searchResults.find(u => u.id === userId);
+                        return user ? (
+                          <div key={userId} className="flex items-center gap-2 bg-primary/10 px-2 py-1 rounded-full text-sm">
+                            <Avatar className="w-5 h-5">
+                              <AvatarImage src={user.avatar_url} />
+                              <AvatarFallback className="text-xs">
+                                {(user.display_name || user.username || '?')[0].toUpperCase()}
+                              </AvatarFallback>
+                            </Avatar>
+                            {user.display_name || user.username}
+                          </div>
+                        ) : null;
+                      })}
+                    </div>
+                  )}
+
+                  <div className="max-h-60 overflow-y-auto space-y-2">
+                    {isSearching ? (
+                      <div className="text-center py-4 text-muted-foreground">
+                        Søker...
+                      </div>
+                    ) : searchResults.length > 0 ? (
+                      searchResults.map((user) => (
+                        <div key={user.id} className="flex items-center space-x-3 p-2 hover:bg-muted rounded-lg">
+                          <Checkbox
+                            checked={selectedUsers.includes(user.id)}
+                            onCheckedChange={() => handleUserSelect(user.id)}
+                          />
+                          <Avatar className="w-8 h-8">
+                            <AvatarImage src={user.avatar_url} />
+                            <AvatarFallback>
+                              {(user.display_name || user.username || '?')[0].toUpperCase()}
+                            </AvatarFallback>
+                          </Avatar>
+                          <div className="flex-1">
+                            <div className="font-medium">
+                              {user.display_name || user.username}
+                            </div>
+                            {user.display_name && user.username && (
+                              <div className="text-sm text-muted-foreground">
+                                @{user.username}
+                              </div>
+                            )}
+                          </div>
+                        </div>
+                      ))
+                    ) : userSearchTerm.length >= 2 ? (
+                      <div className="text-center py-4 text-muted-foreground">
+                        Ingen brukere funnet
+                      </div>
+                    ) : (
+                      <div className="text-center py-4 text-muted-foreground">
+                        Skriv minst 2 tegn for å søke
+                      </div>
+                    )}
+                  </div>
+
+                  <Button 
+                    onClick={handleStartChat}
+                    disabled={selectedUsers.length === 0}
+                    className="w-full"
+                  >
+                    {selectedUsers.length === 1 
+                      ? "Start direktemelding" 
+                      : selectedUsers.length > 1 
+                        ? `Opprett gruppechat (${selectedUsers.length + 1} medlemmer)`
+                        : "Velg minst én person"
+                    }
+                  </Button>
+                </div>
+              </DialogContent>
+            </Dialog>
+
+            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
+              <DialogTrigger asChild>
+                <Button size="sm">
+                  <Plus className="w-4 h-4 mr-2" />
+                  Ny Gruppe
+                </Button>
+              </DialogTrigger>
+              <DialogContent>
+                <DialogHeader>
+                  <DialogTitle>Opprett ny gruppe</DialogTitle>
+                </DialogHeader>
+                <div className="space-y-4">
+                  <div>
+                    <Label htmlFor="group-name">Gruppenavn</Label>
+                    <Input
+                      id="group-name"
+                      value={newGroupName}
+                      onChange={(e) => setNewGroupName(e.target.value)}
+                      placeholder="Skriv inn gruppenavn..."
+                    />
+                  </div>
+                  <div>
+                    <Label htmlFor="group-description">Beskrivelse (valgfritt)</Label>
+                    <Textarea
+                      id="group-description"
+                      value={newGroupDescription}
+                      onChange={(e) => setNewGroupDescription(e.target.value)}
+                      placeholder="Beskriv gruppen..."
+                      rows={3}
+                    />
+                  </div>
+                  <Button 
+                    onClick={handleCreateGroup} 
+                    disabled={isCreating || !newGroupName.trim()}
+                    className="w-full"
+                  >
+                    {isCreating ? "Oppretter..." : "Opprett Gruppe"}
+                  </Button>
+                </div>
+              </DialogContent>
+            </Dialog>
+          </div>
         </div>
       </header>

@@ .. @@
             {filteredGroups.map((group) => (
               <Card 
                 key={group.id} 
                 className="cursor-pointer hover:shadow-md transition-shadow"
-                onClick={() => navigate(`/groups/${group.id}`)}
+                onClick={() => navigate(`/messages/${group.id}`)}
               >
                 <CardHeader className="pb-3">
                   <CardTitle className="flex items-center justify-between">
@@ .. @@
       {/* Floating Add Button for mobile */}
       <div className="fixed bottom-24 right-4 z-30 md:hidden">
-        <Dialog>
+        <Dialog open={newChatDialogOpen} onOpenChange={setNewChatDialogOpen}>
           <DialogTrigger asChild>
             <Button 
               size="lg" 
               className="w-14 h-14 rounded-full shadow-lg bg-gradient-to-r from-primary to-primary/90 hover:shadow-xl transition-all duration-300"
             >
-              <Plus className="w-6 h-6" />
+              <UserPlus className="w-6 h-6" />
             </Button>
           </DialogTrigger>
-          <DialogContent>
+          <DialogContent className="sm:max-w-[500px]">
             <DialogHeader>
-              <DialogTitle>Opprett ny gruppe</DialogTitle>
+              <DialogTitle>Start ny samtale</DialogTitle>
             </DialogHeader>
             <div className="space-y-4">
-              <div>
-                <Label htmlFor="group-name-mobile">Gruppenavn</Label>
+              <div className="relative">
+                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                 <Input
-                  id="group-name-mobile"
-                  value={newGroupName}
-                  onChange={(e) => setNewGroupName(e.target.value)}
-                  placeholder="Skriv inn gruppenavn..."
+                  placeholder="Søk etter venner..."
+                  value={userSearchTerm}
+                  onChange={(e) => handleUserSearch(e.target.value)}
+                  className="pl-10"
                 />
               </div>
-              <div>
-                <Label htmlFor="group-description-mobile">Beskrivelse (valgfritt)</Label>
-                <Textarea
-                  id="group-description-mobile"
-                  value={newGroupDescription}
-                  onChange={(e) => setNewGroupDescription(e.target.value)}
-                  placeholder="Beskriv gruppen..."
-                  rows={3}
-                />
+
+              <div className="max-h-60 overflow-y-auto space-y-2">
+                {searchResults.map((user) => (
+                  <div key={user.id} className="flex items-center space-x-3 p-2 hover:bg-muted rounded-lg">
+                    <Checkbox
+                      checked={selectedUsers.includes(user.id)}
+                      onCheckedChange={() => handleUserSelect(user.id)}
+                    />
+                    <Avatar className="w-8 h-8">
+                      <AvatarImage src={user.avatar_url} />
+                      <AvatarFallback>
+                        {(user.display_name || user.username || '?')[0].toUpperCase()}
+                      </AvatarFallback>
+                    </Avatar>
+                    <div className="flex-1">
+                      <div className="font-medium">
+                        {user.display_name || user.username}
+                      </div>
+                    </div>
+                  </div>
+                ))}
               </div>
+
               <Button 
-                onClick={handleCreateGroup} 
-                disabled={isCreating || !newGroupName.trim()}
+                onClick={handleStartChat}
+                disabled={selectedUsers.length === 0}
                 className="w-full"
               >
-                {isCreating ? "Oppretter..." : "Opprett Gruppe"}
+                Start samtale
               </Button>
             </div>
           </DialogContent>
@@ .. @@