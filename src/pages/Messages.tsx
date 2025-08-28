import { useAuth } from "@/hooks/useAuth";
import { useGroups } from "@/hooks/useGroups";
import { useFriends } from "@/hooks/useFriends";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const Messages = () => {
  const { user } = useAuth();
  const { groups, loading, createGroupWithMembers } = useGroups();
  const { friends, searchUsers } = useFriends();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleCreateGroup = async () => {
    try {
      const group = await createGroupWithMembers("My Group", undefined, []);
      if (group) {
        toast({ description: "Group created successfully!" });
      }
    } catch (err) {
      toast({ description: "Failed to create group" });
    }
  };

  return (
    <div>
      <h1>Messages</h1>
      <Button onClick={handleCreateGroup}>Create Group</Button>
    </div>
  );
};

export default Messages;
