import { useEffect, useState } from "react";
import { supabase } from "../integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

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
  const [newMessage, setNewMessage] = useState("");
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const user = supabase.auth.user();
      if (user) setUserId(user.id);
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (userId) fetchChats();
  }, [userId]);

  const fetchChats = async () => {
    const { data, error } = await supabase
      .from("chats")
      .select("*")
      .or(`user1.eq.${userId},user2.eq.${userId}`)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching chats:", error);
    } else {
      setChats(data);
    }
  };

  const fetchMessages = async (chatId: string) => {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("chat_id", chatId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching messages:", error);
    } else {
      setMessages(data);
    }
  };

  const sendMessage = async () => {
    if (!selectedChat || !newMessage || !userId) return;

    const { error } = await supabase.from("messages").insert([
      {
        chat_id: selectedChat.id,
        sender: userId,
        content: newMessage,
      },
    ]);

    if (error) {
      console.error("Error sending message:", error);
    } else {
      setNewMessage("");
      fetchMessages(selectedChat.id);
    }
  };

  const getChatTitle = (chat: Chat) => {
    if (!userId) return "";
    return chat.user1 === userId ? chat.user2 : chat.user1;
  };

  return (
    <div className="flex h-full gap-4 p-4">
      {/* Venstre kolonne - Chat liste */}
      <div className="w-1/3 border rounded p-2 flex flex-col">
        <h2 className="text-lg font-bold mb-2">Chatter</h2>
        <div className="flex-1 overflow-y-auto">
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
                  {chat.created_at
                    ? new Date(chat.created_at).toLocaleString()
                    : ""}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>

      {/* Høyre kolonne - Meldinger */}
      <div className="flex-1 flex flex-col border rounded p-2">
        <div className="flex-1 overflow-y-auto mb-2">
          {selectedChat ? (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`mb-2 p-2 rounded max-w-xs ${
                  msg.sender === userId
                    ? "bg-blue-100 ml-auto text-right"
                    : "bg-gray-100"
                }`}
              >
                {msg.content}
              </div>
            ))
          ) : (
            <div className="text-gray-500">
              Velg en chat for å starte samtale
            </div>
          )}
        </div>
        {selectedChat && (
          <div className="flex gap-2">
            <Input
              placeholder="Skriv melding..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") sendMessage();
              }}
            />
            <Button onClick={sendMessage}>Send</Button>
          </div>
        )}
      </div>
    </div>
  );
}
