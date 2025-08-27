import { supabase } from "@/integrations/supabase/client";

export async function getChatsForUser(userId: string) {
  const { data, error } = await supabase
    .from("chats")
    .select("id, user1, user2, messages(*)")
    .or(`user1.eq.${userId},user2.eq.${userId}`)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data;
}

export async function sendMessage(chatId: string, senderId: string, content: string) {
  const { data, error } = await supabase
    .from("messages")
    .insert([{ chat_id: chatId, sender: senderId, content }])
    .select()
    .single();

  if (error) throw error;
  return data;
}
