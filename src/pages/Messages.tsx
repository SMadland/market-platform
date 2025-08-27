import { useState, useEffect } from "react";
import { supabase } from "../integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Profile {
  id: string;
  username: string;
}

interface Chat {
  id: string;
  user1: string;
  user2: string;
  created_at: string;
}

interface Message {
  id: string;
  chat_id: string;
  sender: string;
  content: string;
  created_at: string;
}

export default function Messages() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [friendSearch, setFriendSearch] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [profiles, setProfiles] = useState<Record<string, Profile>>({}); // cache for usernames

  const fetchUserId = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id || "";
  };

  const [userId, setUserId] = useState<string>("");

  useEffect(() => {
    fetchUserId().then(id => setUserId(id));
  }, []);

  const fetchProfiles = async () => {
    const { data } = await supabase.from("profiles").select("*");
    if (data) {
      const profileMap: Record<string, Profile> = {};
      data.forEach(p => (profileMap[p.id] = p));
      setProfiles(profileMap);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchChats = async () => {
    if (!userId) return;
    const { data } = await supabase
      .from("chats")
      .select("*")
      .or(`user1.eq.${userId},user2.eq.${userId}`)
      .order("created_at", { ascending: false });
    setChats(data || []);
  };

  useEffect(() => {
    if (userId) fetchChats();
  }, [userId]);

  const fetchMessages = async (chatId: string) => {
    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("chat_id", chatId)
      .order("created_at", { ascending: true });
    setMessages(data || []);
  };

  const createChat = async () => {
    if (!friendSearch || !userId) return;

    const { data: users } = await supabase
      .from("profiles")
      .select("*")
      .eq("username", friendSearch)
      .limit(1);

    if (!users || users.length === 0) {
      alert("Fant ingen bruker med det brukernavnet");
      return;
    }

    const otherUserId = users[0].id;

    // Sjekk om chat allerede finnes
    const { data: existingChats } = await supabase
      .from("chats")
      .select("*")
      .or(`user1.eq.${userId},user2.eq.${userId}`)
      .or(`user1.eq.${otherUserId},user2.eq.${otherUserId}`);

    if (existingChats && existingChats.length > 0) {
      setSelectedChat(existingChats[0]);
      fetchMessages(existingChats[0].id);
      return;
    }

    // Opprett ny chat
    const { data: newChat } = await supabase
      .from("chats")
      .insert([{ user1: userId, user2: otherUserId }])
      .select()
      .single();

    setChats([newChat, ...chats]);
    setSelectedChat(newChat);
    setMessages([]);
  };

  const sendMessage = async () => {
    if (!newMessage || !selectedChat || !userId) return;

    const { data } = await supabase
      .from("messages")
      .insert([{ chat_id: selectedChat.id, sender: userId, content: newMessage }])
      .select()
      .single();

    setMessages([...messages, data]);
    setNewMessage("");
  };

  const getChatTitle = (chat: Chat) => {
    const otherUserId = chat.user1 === userId ? chat.user2 : chat.user1;
    return profiles[otherUserId]?.username || "Ukjent";
  };

  return (
    <div className="flex h-full gap-4 p-4">
      {/* Venstre kolonne: Chater */}
      <div className="w-1/3 flex flex-col gap-2">
        <Input
          placeholder="Søk etter venn..."
          value={friendSearch}
          onChange={(e) => setFriendSearch(e.target.value)}
        />
        <Button className="mt-2" onClick={createChat}>
          Start Chat
        </Button>

        <ScrollArea className="mt-4 flex-1">
          {chats.map((chat) => (
            <Card
              key={chat.id}
              className={`mb-2 cursor-pointer transition ${
                selectedChat?.id === chat.id ? "border-blue-500 border" : ""
              }`}
              onClick={() => {
                setSelectedChat(chat);
                fetchMessages(chat.id);
              }}
            >
              <CardHeader>
                <CardTitle>{getChatTitle(chat)}</CardTitle>
                <CardDescription>
                  {chat.created_at ? new Date(chat.created_at).toLocaleString() : ""}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </ScrollArea>
      </div>

      {/* Høyre kolonne: Meldinger */}
      <div className="w-2/3 flex flex-col gap-2">
        <ScrollArea className="flex-1 border rounded p-2">
          {selectedChat ? (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`mb-2 p-2 rounded max-w-xs ${
                  msg.sender === userId ? "bg-blue-100 ml-auto text-right" : "bg-gray-100"
                }`}
              >
                {msg.content}
              </div>
            ))
          ) : (
            <div className="text-gray-500">Velg en chat for å starte samtale</div>
          )}
        </ScrollArea>

        {selectedChat && (
          <div className="flex gap-2 mt-2">
            <Input
              placeholder="Skriv en melding..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <Button onClick={sendMessage}>Send</Button>
          </div>
        )}
      </div>
    </div>
  );
}
