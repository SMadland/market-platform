import { useAuth } from "@/hooks/useAuth";
import { useGroups } from "@/hooks/useGroups";
import { useFriends } from "@/hooks/useFriends";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const Messages = () => {
  const { user } = useAuth();
  const { groups, createGroupWithMembers } = useGroups();
  const { friends } = useFriends();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Eksempel på dialog state
  const handleCreateGroup = async () => {
    try {
      const group = await createGroupWithMembers(
        "Ny gruppe",
        undefined,
        friends.map((f) => f.user_id)
      );

      if (group) {
        toast({ title: "Gruppe opprettet!" });
        navigate(`/chat/${group.id}`);
      }
    } catch (err) {
      toast({ title: "Kunne ikke opprette gruppe", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-background">
        <div className="px-4 h-16 flex items-center justify-between">
          <h1 className="text-xl font-bold">Meldinger</h1>

          {/* Ny gruppe knapp */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">Ny gruppe</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Opprett ny gruppe</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col gap-4">
                {/* Du kan legge til søk/venneliste her */}
                <Button onClick={handleCreateGroup}>Opprett</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      {/* Innhold */}
      <div className="p-4">
        {groups.length === 0 ? (
          <p className="text-muted-foreground">Du har ingen grupper ennå.</p>
        ) : (
          <ul className="space-y-2">
            {groups.map((group) => (
              <li key={group.id}>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => navigate(`/chat/${group.id}`)}
                >
                  {group.name}
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Messages;
