import { supabase } from "@/integrations/supabase/client";

// Hent alle chatter for en bruker
export async function getChatsForUser(userId: string) {
  const { data, error } = await supabase
    .from("chats")
    .select("id, user1, user2, messages(*)")
    .or(`user1.eq.${userId},user2.eq.${userId}`)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching chats:", error);
    return [];
  }

  return data;
}

// Opprett ny chat mellom to brukere
export async function createChat(user1Id: string, user2Id: string) {
  const { data, error } = await supabase
    .from("chats")
    .insert([{ user1: user1Id, user2: user2Id }])
    .select()
    .single();

  if (error) {
    console.error("Error creating chat:", error);
    return null;
  }

  return data;
}

// Send melding i en chat
export async function sendMessage(chatId: string, senderId: string, content: string) {
  const { data, error } = await supabase
    .from("messages")
    .insert([{ chat_id: chatId, sender: senderId, content }])
    .select()
    .single();

  if (error) {
    console.error("Error sending message:", error);
    return null;
  }

  return data;
}

// Lytt på nye meldinger i en chat (realtime)
export function subscribeToMessages(chatId: string, callback: (message: any) => void) {
  return supabase
    .from(`messages:chat_id=eq.${chatId}`)
    .on("INSERT", payload => {
      callback(payload.new);
    })
    .subscribe();
}
