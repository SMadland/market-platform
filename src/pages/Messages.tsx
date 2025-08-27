import { useEffect, useState } from "react";
import { supabase } from "../integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Profile = {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
};

type Chat = {
  id: string;
  user1: string;
  user2: string;
  created_at: string;
};

type Message = {
  id: string;
  chat_id: string;
  sender: string;
  content: string;
  created_at: string;
};

export default function Messages() {
  const [user, setUser] = useState<Profile | null>(null);
  const [friends, setFriends] = useState<Profile[]>([]);
  const [search, setSearch] = useState("");
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");

  // Hent innlogget bruker
  useEffect(() => {
    const sessionUser = supabase.auth.getUser().then(res => setUser(res.data.user ?? null));
  }, []);

  // Hent eksisterende chatter
  useEffect(() => {
    if (!user) return;
    fetchChats();
  }, [user]);

  async function fetchChats() {
    const { data, error } = await supabase
      .from("chats")
      .select("*")
      .or(`user1.eq.${user!.id},user2.eq.${user!.id}`)
      .order("created_at", { ascending: false });

    if (error) console.error("Error fetching chats:", error);
    else setChats(data);
  }

  // Hent meldinger for valgt chat
  useEffect(() => {
    if (!selectedChat) return;
    fetchMessages(selectedChat.id);
  }, [selectedChat]);

  async function fetchMessages(chatId: string) {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("chat_id", chatId)
      .order("created_at", { ascending: true });

    if (error) console.error("Error fetching messages:", error);
    else setMessages(data);
  }

  // Søk etter venner
  async function searchFriends() {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .ilike("username", `%${search}%`);

    if (error) console.error("Error searching friends:", error);
    else setFriends(data);
  }

  // Opprett ny chat
  async function createChat(friendId: string) {
    if (!user) return;
    const { data: existing, error: checkError } = await supabase
      .from("chats")
      .select("*")
      .or(`user1.eq.${user.id},user2.eq.${user.id}`)
      .eq("user1", friendId)
      .or(`user2.eq.${friendId}`);

    if (checkError) {
      console.error("Error checking existing chat:", checkError);
      return;
    }

    if (existing && existing.length > 0) {
      setSelectedChat(existing[0]);
      return;
    }

    const { data, error } = await supabase
      .from("chats")
      .insert([{ user1: user.id, user2: friendId }])
      .select()
      .single();

    if (error) console.error("Error creating chat:", error);
    else setSelectedChat(data);
  }

  // Send melding
  async function sendMessage() {
    if (!user || !selectedChat) return;
    const { error } = await supabase.from("messages").insert([
      { chat_id: selectedChat.id, sender: user.id, content: newMessage },
    ]);
    if (error) console.error("Error sending message:", error);
    else {
      setNewMessage("");
      fetchMessages(selectedChat.id);
    }
  }

  return (
    <div className="flex h-full gap-4">
      {/* Venner & chatter */}
      <div className="w-1/3 flex flex-col gap-2">
        <Input
          placeholder="Søk etter venner..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Button onClick={searchFriends}>Søk</Button>

        <ScrollArea className="h-full mt-2">
          {friends.map((friend) => (
            <Card key={friend.id} className="mb-2 cursor-pointer" onClick={() => createChat(friend.id)}>
              <CardHeader>
                <CardTitle>{friend.username}</CardTitle>
              </CardHeader>
            </Card>
          ))}

          {chats.map((chat) => (
            <Card key={chat.id} className="mb-2 cursor-pointer" onClick={() => setSelectedChat(chat)}>
              <CardHeader>
                <CardTitle>
                  {chat.user1 === user?.id ? chat.user2 : chat.user1}
                </CardTitle>
              </CardHeader>
            </Card>
          ))}
        </ScrollArea>
      </div>

      {/* Meldinger */}
      <div className="w-2/3 flex flex-col gap-2">
        {selectedChat ? (
          <>
            <ScrollArea className="flex-1 border rounded p-2">
              {messages.map((msg) => (
                <div key={msg.id} className={msg.sender === user?.id ? "text-right" : "text-left"}>
                  <div className="inline-block bg-gray-200 rounded px-3 py-1 my-1">
                    {msg.content}
                  </div>
                </div>
              ))}
            </ScrollArea>

            <div className="flex gap-2 mt-2">
              <Input
                placeholder="Skriv melding..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
              <Button onClick={sendMessage}>Send</Button>
            </div>
          </>
        ) : (
          <div>Velg en chat for å starte samtale</div>
        )}
      </div>
    </div>
  );
}
