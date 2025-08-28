import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export interface Group {
  id: string;
  name: string;
  description: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  member_count?: number;
}

export interface GroupMessage {
  id: string;
  group_id: string;
  user_id: string;
  message: string;
  tip_id: string | null;
  created_at: string;
  profiles?: {
    username: string | null;
    display_name: string | null;
  } | null;
  tips?: {
    title: string;
    product_name: string | null;
  } | null;
}

export const useGroups = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGroups = async () => {
    if (!user) return;
    
    try {
      const { data: groupsData, error } = await supabase
        .from("groups")
        .select(`
          *,
          group_members!inner(*)
        `)
        .order("updated_at", { ascending: false });

      if (error) throw error;

      // Get member counts
      const groupsWithCounts = await Promise.all(
        (groupsData || []).map(async (group) => {
          const { count } = await supabase
            .from("group_members")
            .select("*", { count: "exact", head: true })
            .eq("group_id", group.id);
          
          return {
            ...group,
            member_count: count || 0
          };
        })
      );

      setGroups(groupsWithCounts);
    } catch (error) {
      console.error("Error fetching groups:", error);
      toast({
        title: "Feil",
        description: "Kunne ikke laste grupper. Prøv igjen.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createGroup = async (name: string, description?: string) => {
  }
  const createGroup = async (name: string, description?: string, memberIds: string[] = []) => {
    if (!user) return null;

    try {
      const { data: group, error: groupError } = await supabase
        .from("groups")
        .insert({
          name,
          description,
          created_by: user.id
        })
        .select()
        .single();

      if (groupError) throw groupError;

      // Add creator as member
      const { error: memberError } = await supabase
        .from("group_members")
        .insert({
          group_id: group.id,
          user_id: user.id,
          role: "admin"
        });

      if (memberError) throw memberError;

      // Add selected members to the group
      if (memberIds.length > 0) {
        const memberInserts = memberIds.map(memberId => ({
          group_id: group.id,
          user_id: memberId,
          role: "member"
        }));

        const { error: membersError } = await supabase
          .from("group_members")
          .insert(memberInserts);

        if (membersError) throw membersError;
      }

      await fetchGroups();
      
      toast({
        title: "Gruppe opprettet",
        description: `Gruppen "${name}" ble opprettet.`,
      });

      return group;
    } catch (error) {
      console.error("Error creating group:", error);
      toast({
        title: "Feil",
        description: "Kunne ikke opprette gruppe. Prøv igjen.",
        variant: "destructive",
      });
      return null;
    }
  };

  useEffect(() => {
    fetchGroups();
  }, [user]);

  return { groups, loading, createGroup, refreshGroups: fetchGroups };
};