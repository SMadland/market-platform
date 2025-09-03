import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface Friend {
  id: string;
  user_id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  bio?: string | null;
  created_at?: string;
  updated_at?: string;
  friendship_status?: 'accepted' | 'pending' | 'none';
  name?: string; // Computed field for display
  avatar?: string; // Computed field for display
}

interface FriendRequest {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: string;
  created_at: string;
  requester_profile?: {
    username: string | null;
    display_name: string | null;
    avatar_url: string | null;
  };
  // Computed fields
  name?: string;
  username?: string;
  avatar?: string;
}

export const useFriends = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFriends = async () => {
    if (!user) return;
    
    try {
      // Get accepted friendships
      const { data: friendshipsData, error } = await supabase
        .from("friendships")
        .select("*")
        .eq("status", "accepted")
        .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`);

      if (error) throw error;

      // Get profiles for friends
      const friendIds = friendshipsData?.map(friendship => 
        friendship.requester_id === user.id ? friendship.addressee_id : friendship.requester_id
      ) || [];

      if (friendIds.length > 0) {
        const { data: profilesData, error: profilesError } = await supabase
          .from("profiles")
          .select("*")
          .in("user_id", friendIds);

        if (profilesError) throw profilesError;

        const friendsWithComputedFields = (profilesData || []).map(profile => ({
          ...profile,
          id: profile.user_id,
          name: profile.display_name || profile.username,
          avatar: profile.avatar_url,
          friendship_status: 'accepted' as const
        }));
        setFriends(friendsWithComputedFields);
      } else {
        setFriends([]);
      }
    } catch (error) {
      console.error("Error fetching friends:", error);
      toast({
        title: "Feil",
        description: "Kunne ikke laste venner. Prøv igjen.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchFriendRequests = async () => {
    if (!user) return;
    
    try {
      const { data: friendshipsData, error } = await supabase
        .from("friendships")
        .select("*")
        .eq("addressee_id", user.id)
        .eq("status", "pending");

      if (error) throw error;

      // Fetch profiles for each requester
      const requestsWithProfiles = await Promise.all(
        (friendshipsData || []).map(async (friendship) => {
          const { data: profileData } = await supabase
            .from("profiles")
            .select("username, display_name, avatar_url")
            .eq("user_id", friendship.requester_id)
            .single();

          return {
            ...friendship,
            requester_profile: profileData,
            name: profileData?.display_name || profileData?.username || 'Ukjent',
            username: profileData?.username || '',
            avatar: profileData?.avatar_url
          };
        })
      );

      setFriendRequests(requestsWithProfiles);
    } catch (error) {
      console.error("Error fetching friend requests:", error);
    }
  };

  const searchUsers = async (searchTerm: string): Promise<Friend[]> => {
    if (!user || searchTerm.length < 2) return [];

    console.log('Searching for users with term:', searchTerm);
    
    try {
      const { data: profilesData, error } = await supabase
        .from("profiles")
        .select("*")
        .neq("user_id", user.id)
        .or(`username.ilike.%${searchTerm}%,display_name.ilike.%${searchTerm}%`)
        .limit(20);

      if (error) throw error;
      
      console.log('Raw profiles data:', profilesData);

      // Check friendship status for each user
      const usersWithStatus = await Promise.all(
        (profilesData || []).map(async (profile) => {
          const { data: friendshipData } = await supabase
            .from("friendships")
            .select("status")
            .or(`and(requester_id.eq.${user.id},addressee_id.eq.${profile.user_id}),and(requester_id.eq.${profile.user_id},addressee_id.eq.${user.id})`)
            .maybeSingle();

          return {
            ...profile,
            id: profile.user_id,
            user_id: profile.user_id, // Ensure this field is available
            friendship_status: (friendshipData?.status as 'accepted' | 'pending' | 'none') || 'none',
            name: profile.display_name || profile.username,
            avatar: profile.avatar_url
          };
        })
      );

      console.log('Users with status:', usersWithStatus);
      return usersWithStatus;
    } catch (error) {
      console.error("Error searching users:", error);
      return [];
    }
  };

  const getUserById = async (userId: string): Promise<Friend | null> => {
    try {
      const { data: profileData, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error) throw error;

      return {
        ...profileData,
        id: profileData.user_id,
        user_id: profileData.user_id,
        friendship_status: 'none',
        name: profileData.display_name || profileData.username,
        avatar: profileData.avatar_url
      };
    } catch (error) {
      console.error("Error fetching user by ID:", error);
      return null;
    }
  };

  const sendFriendRequest = async (addresseeId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from("friendships")
        .insert({
          requester_id: user.id,
          addressee_id: addresseeId,
          status: "pending"
        });

      if (error) throw error;

      toast({
        title: "Venneforespørsel sendt",
        description: "Din venneforespørsel er sendt!",
      });

      return true;
    } catch (error) {
      console.error("Error sending friend request:", error);
      toast({
        title: "Feil",
        description: "Kunne ikke sende venneforespørsel. Prøv igjen.",
        variant: "destructive",
      });
      return false;
    }
  };

  const acceptFriendRequest = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from("friendships")
        .update({ status: "accepted" })
        .eq("id", requestId);

      if (error) throw error;

      toast({
        title: "Venneforespørsel akseptert",
        description: "Dere er nå venner!",
      });

      await fetchFriends();
      await fetchFriendRequests();
      return true;
    } catch (error) {
      console.error("Error accepting friend request:", error);
      toast({
        title: "Feil",
        description: "Kunne ikke akseptere venneforespørsel. Prøv igjen.",
        variant: "destructive",
      });
      return false;
    }
  };

  const rejectFriendRequest = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from("friendships")
        .delete()
        .eq("id", requestId);

      if (error) throw error;

      toast({
        title: "Venneforespørsel avvist",
        description: "Forespørselen er avvist.",
      });

      await fetchFriendRequests();
      return true;
    } catch (error) {
      console.error("Error rejecting friend request:", error);
      toast({
        title: "Feil",
        description: "Kunne ikke avvise venneforespørsel. Prøv igjen.",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    if (user) {
      fetchFriends();
      fetchFriendRequests();
    }
  }, [user]);

  return {
    friends,
    friendRequests,
    loading,
    searchUsers,
    getUserById,
    sendFriendRequest,
    addFriend: sendFriendRequest, // Alias for compatibility
    acceptFriendRequest,
    rejectFriendRequest,
    declineFriendRequest: rejectFriendRequest, // Alias for compatibility
    refreshFriends: fetchFriends,
    refreshFriendRequests: fetchFriendRequests
  };
};