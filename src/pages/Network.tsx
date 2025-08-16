import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, UserPlus, Users, UserCheck } from "lucide-react";

const Network = () => {
  const [searchTerm, setSearchTerm] = useState("");

  // Mock data - replace with real data later
  const mockUsers = [
    { id: 1, name: "Anna Hansen", username: "anna_h", mutualFriends: 3, isConnected: false },
    { id: 2, name: "Lars Olsen", username: "lars_o", mutualFriends: 5, isConnected: true },
    { id: 3, name: "Maria Karlsen", username: "maria_k", mutualFriends: 2, isConnected: false },
  ];

  const filteredUsers = mockUsers.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            placeholder="Søk etter venner..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-background border-border focus:border-primary"
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card className="p-4 text-center">
            <Users className="w-6 h-6 mx-auto mb-2 text-primary" />
            <div className="text-2xl font-bold">12</div>
            <div className="text-sm text-muted-foreground">Venner</div>
          </Card>
          <Card className="p-4 text-center">
            <UserPlus className="w-6 h-6 mx-auto mb-2 text-accent" />
            <div className="text-2xl font-bold">3</div>
            <div className="text-sm text-muted-foreground">Forespørsler</div>
          </Card>
        </div>

        {/* User List */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold mb-3">Foreslåtte venner</h2>
          {filteredUsers.map((user) => (
            <Card key={user.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{user.name}</div>
                    <div className="text-sm text-muted-foreground">@{user.username}</div>
                    <div className="text-xs text-muted-foreground">
                      {user.mutualFriends} felles venner
                    </div>
                  </div>
                </div>
                <Button 
                  size="sm" 
                  variant={user.isConnected ? "secondary" : "default"}
                  className={user.isConnected ? "" : "bg-gradient-to-r from-primary to-primary/90"}
                >
                  {user.isConnected ? (
                    <>
                      <UserCheck className="w-4 h-4 mr-2" />
                      Venner
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
        </div>

        {filteredUsers.length === 0 && searchTerm && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Ingen brukere funnet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Network;