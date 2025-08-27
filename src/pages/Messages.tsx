import { useEffect, useState } from "react";
import { supabase } from "../integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface Profile {
  id: string;
  username: string;
}

interface Chat {
  id: string;
  user1: string;
  user2: string;
}

interface Message {
  id: string;
  chat_id: string;
  sender: string;
  content: string;
  created_at: string;
}

export default function Messages() {
  const [user, setUser] = useState<Profile | null>(null);
  const [friends, setFriends] = useState<Profile[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");

  // Hent innlogget bruker
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser({ id: user.id, username: user.email || "unknown" });
      }
    };
    fetchUser();
  }, []);

  // Hent venner (andre profiler)
  useEffect(() => {
    const fetchFriends = async () => {
      const { data } = await supabase.from("profiles").select("*");
      setFriends(data || []);
    };
    fetchFriends();
  }, []);

  // Hent eksisterende chatter
  useEffect(() => {
    if (!user) return;
    const fetchChats = async () => {
      const { data } = await supabase
        .from("chats")
        .select("*")
        .or(`user1.eq.${user.id},user2.eq.${user.id}`)
        .order("created_at", { ascending: false });
      setChats(data || []);
    };
    fetchChats();
  }, [user]);

  // Hent meldinger for valgt chat
  useEffect(() => {
    if (!selectedChat) return;
    const fetchMessages = async () => {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .eq("chat_id", selectedChat.id)
        .order("created_at", { ascending: true });
      setMessages(data || []);
    };
    fetchMessages();
  }, [selectedChat]);

  const sendMessage = async () => {
    if (!user || !selectedChat || !newMessage) return;
    await supabase.from("messages").insert({
      chat_id: selectedChat.id,
      sender: user.id,
      content: newMessage,
    });
    setNewMessage("");
    // Oppdater meldinger
    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("chat_id", selectedChat.id)
      .order("created_at", { ascending: true });
    setMessages(data || []);
  };

  const startChat = async (friend: Profile) => {
    if (!user) return;

    // Sjekk om chat allerede finnes
    const existing = chats.find(
      (c) =>
        (c.user1 === user.id && c.user2 === friend.id) ||
        (c.user2 === user.id && c.user1 === friend.id)
    );

    if (existing) {
      setSelectedChat(existing);
      return;
    }

    // Opprett ny chat
    const { data } = await supabase.from("chats").insert({
      user1: user.id,
      user2: friend.id,
    }).select("*").single();

    if (data) {
      setChats([data, ...chats]);
      setSelectedChat(data);
    }
  };

  return (
    <div className="flex h-full gap-4 p-4">
      {/* Venstre kolonne: venner og chatter */}
      <Card className="w-1/3 flex flex-col">
        <CardHeader>
          <CardTitle>Chatter og venner</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto">
          {friends.map((friend) => (
            <div
              key={friend.id}
              className="p-2 hover:bg-gray-100 cursor-pointer rounded"
              onClick={() => startChat(friend)}
            >
              {friend.username}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Høyre kolonne: meldinger */}
      <Card className="flex-1 flex flex-col">
        <CardHeader>
          <CardTitle>
            {selectedChat ? `Chat med ${
              friends.find(f => f.id === (selectedChat.user1 === user?.id ? selectedChat.user2 : selectedChat.user1))?.username
            }` : "Velg en chat for å starte samtale"}
          </CardTitle>
        </CardHeader>
        {selectedChat && (
          <CardContent className="flex flex-col flex-1 gap-2">
            <div className="flex-1 overflow-y-auto border rounded p-2">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={msg.sender === user?.id ? "text-right" : "text-left"}
                >
                  <div className="inline-block bg-gray-200 rounded px-3 py-1 my-1">
                    {msg.content}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-2">
              <Input
                placeholder="Skriv melding..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
              <Button onClick={sendMessage}>Send</Button>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
