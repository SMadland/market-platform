import { useEffect, useState } from "react";
import { supabase } from "../integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Profile {
  id: string;
  username: string;
  avatar_url?: string;
}

interface Message {
  id: string;
  chat_id: string;
  sender: string;
  content: string;
  created_at: string;
}

interface Chat {
  id: string;
  user1: string;
  user2: string;
  created_at: string;
  messages?: Message[];
}

export default function Messages() {
  const [user, setUser] = useState<Profile | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [newMessage, setNewMessage] = useState("");

  // Hent innlogget bruker
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser({ id: user.id, username: user.email || "user" });
      }
    };
    fetchUser();
  }, []);

  // Hent chater til brukeren
  useEffect(() => {
    if (!user) return;
    const fetchChats = async () => {
      const { data, error } = await supabase
        .from("chats")
        .select("*, messages(*)")
        .or(`user1.eq.${user.id},user2.eq.${user.id}`)
        .order("created_at", { ascending: false });
      if (!error) setChats(data || []);
    };
    fetchChats();
  }, [user]);

  const handleSendMessage = async () => {
    if (!selectedChat || !user || !newMessage) return;

    const { error } = await supabase.from("messages").insert({
      id: uuidv4(),
      chat_id: selectedChat.id,
      sender: user.id,
      content: newMessage,
    });

    if (!error) {
      setNewMessage("");
      // oppdater meldinger lokalt
      setChats((prev) =>
        prev.map((chat) =>
          chat.id === selectedChat.id
            ? { ...chat, messages: [...(chat.messages || []), { id: uuidv4(), chat_id: chat.id, sender: user.id, content: newMessage, created_at: new Date().toISOString() }] }
            : chat
        )
      );
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 p-4">
      {/* Chat liste */}
      <div className="w-full md:w-1/3 space-y-2">
        {chats.map((chat) => (
          <Card
            key={chat.id}
            className="cursor-pointer hover:bg-gray-100"
            onClick={() => setSelectedChat(chat)}
          >
            <CardContent>
              <div>
                Chat med: {chat.user1 === user?.id ? chat.user2 : chat.user1}
              </div>
              <div className="text-sm text-gray-500">
                {chat.messages && chat.messages.length > 0
                  ? chat.messages[chat.messages.length - 1].content
                  : "Ingen meldinger"}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Chat detaljer */}
      <div className="flex-1 flex flex-col space-y-2">
        {selectedChat ? (
          <>
            <div className="flex-1 overflow-y-auto p-2 border rounded-md">
              {(selectedChat.messages || []).map((msg) => (
                <div
                  key={msg.id}
                  className={`p-2 my-1 rounded-md ${
                    msg.sender === user?.id ? "bg-blue-100 text-right" : "bg-gray-200 text-left"
                  }`}
                >
                  {msg.content}
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Skriv en melding..."
              />
              <Button onClick={handleSendMessage}>Send</Button>
            </div>
          </>
        ) : (
          <div className="text-gray-500 p-4">Velg en chat for å starte samtale</div>
        )}
      </div>
    </div>
  );
}
