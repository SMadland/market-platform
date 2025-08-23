import { useAuth } from "@/hooks/useAuth";
import { useGroups, Group } from "@/hooks/useGroups";
import { useFriends } from "@/hooks/useFriends";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const Messages = () => {
  const { user } = useAuth();
  const { groups, loading, createGroupWithMembers } = useGroups();
  const { friends, searchUsers } = useFriends();

      // Create group with selected members
      const group = await createGroupWithMembers(groupName, undefined, selectedPeople.map(p => p.user_id));
      
      if (group) {