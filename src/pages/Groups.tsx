import { useState } from "react";
import { useGroups } from "@/hooks/useGroups";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, Users, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Groups = () => {
  const navigate = useNavigate();
  const { groups, loading, createGroup } = useGroups();
  const [isCreating, setIsCreating] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDescription, setNewGroupDescription] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) return;

    setIsCreating(true);
    const group = await createGroup(newGroupName, newGroupDescription);
    
    if (group) {
      setNewGroupName("");
      setNewGroupDescription("");
      setDialogOpen(false);
      navigate(`/groups/${group.id}`);
    }
    
    setIsCreating(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-20 flex items-center justify-center">
        <div className="text-muted-foreground">Laster grupper...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="px-4 h-16 flex items-center justify-between">
          <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Grupper
          </h1>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Ny Gruppe
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Opprett ny gruppe</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="group-name">Gruppenavn</Label>
                  <Input
                    id="group-name"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    placeholder="Skriv inn gruppenavn..."
                  />
                </div>
                <div>
                  <Label htmlFor="group-description">Beskrivelse (valgfritt)</Label>
                  <Textarea
                    id="group-description"
                    value={newGroupDescription}
                    onChange={(e) => setNewGroupDescription(e.target.value)}
                    placeholder="Beskriv gruppen..."
                    rows={3}
                  />
                </div>
                <Button 
                  onClick={handleCreateGroup} 
                  disabled={isCreating || !newGroupName.trim()}
                  className="w-full"
                >
                  {isCreating ? "Oppretter..." : "Opprett Gruppe"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      {/* Groups Content */}
      <div className="p-4 space-y-4">
        {groups.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Ingen grupper ennå</h2>
            <p className="text-muted-foreground mb-4">
              Opprett din første gruppe for å chatte med venner om produkter
            </p>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Opprett første gruppe
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Opprett ny gruppe</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="group-name-empty">Gruppenavn</Label>
                    <Input
                      id="group-name-empty"
                      value={newGroupName}
                      onChange={(e) => setNewGroupName(e.target.value)}
                      placeholder="Skriv inn gruppenavn..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="group-description-empty">Beskrivelse (valgfritt)</Label>
                    <Textarea
                      id="group-description-empty" 
                      value={newGroupDescription}
                      onChange={(e) => setNewGroupDescription(e.target.value)}
                      placeholder="Beskriv gruppen..."
                      rows={3}
                    />
                  </div>
                  <Button 
                    onClick={handleCreateGroup} 
                    disabled={isCreating || !newGroupName.trim()}
                    className="w-full"
                  >
                    {isCreating ? "Oppretter..." : "Opprett Gruppe"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        ) : (
          <div className="grid gap-4">
            {groups.map((group) => (
              <Card 
                key={group.id} 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigate(`/groups/${group.id}`)}
              >
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between">
                    <span className="text-lg">{group.name}</span>
                    <MessageCircle className="w-5 h-5 text-muted-foreground" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {group.description && (
                    <p className="text-muted-foreground text-sm mb-2">
                      {group.description}
                    </p>
                  )}
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Users className="w-4 h-4 mr-1" />
                    {group.member_count} medlem{group.member_count !== 1 ? "mer" : ""}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Floating Add Button for mobile */}
      <div className="fixed bottom-24 right-4 z-30 md:hidden">
        <Dialog>
          <DialogTrigger asChild>
            <Button 
              size="lg" 
              className="w-14 h-14 rounded-full shadow-lg bg-gradient-to-r from-primary to-primary/90 hover:shadow-xl transition-all duration-300"
            >
              <Plus className="w-6 h-6" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Opprett ny gruppe</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="group-name-mobile">Gruppenavn</Label>
                <Input
                  id="group-name-mobile"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="Skriv inn gruppenavn..."
                />
              </div>
              <div>
                <Label htmlFor="group-description-mobile">Beskrivelse (valgfritt)</Label>
                <Textarea
                  id="group-description-mobile"
                  value={newGroupDescription}
                  onChange={(e) => setNewGroupDescription(e.target.value)}
                  placeholder="Beskriv gruppen..."
                  rows={3}
                />
              </div>
              <Button 
                onClick={handleCreateGroup} 
                disabled={isCreating || !newGroupName.trim()}
                className="w-full"
              >
                {isCreating ? "Oppretter..." : "Opprett Gruppe"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Groups;