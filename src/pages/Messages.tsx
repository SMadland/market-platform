// src/pages/Messages.tsx
import React, { useEffect, useState } from "react";
import { supabase } from "../integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Avatar, AvatarFallback } from "../components/ui/avatar";

interface Chat {
  id: string;
  user1: string;
  user2: string;
  created_at: string;
}

interface Message {
  id: string;
  chat_id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

export default function Messages() {
  const [user, setUser] = useState<any>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [newMessage, setNewMessage] = useState("");

  // Hent innlogget bruker
  useEffect(() => {
    const getUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (!error && data?.user) {
        setUser(data.user);
      }
    };
    getUser();
  }, []);

  // Hent chatter
  useEffect(() => {
    const fetchChats = async () => {
      if (!user) return;
      const { data, error } = await supabase
        .from("chats")
        .select("*")
        .or(`user1.eq.${user.id},user2.eq.${user.id}`)
        .order("created_at", { ascending: false });

      if (!error && data) setChats(data);
    };
    fetchChats();
  }, [user]);

  // Hent meldinger når en chat er valgt
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedChat) return;
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("chat_id", selectedChat.id)
        .order("created_at", { ascending: true });

      if (!error && data) setMessages(data);
    };
    fetchMessages();
  }, [selectedChat]);

  // Send melding
  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedChat || !user) return;

    const { error } = await supabase.from("messages").insert({
      chat_id: selectedChat.id,
      sender_id: user.id,
      content: newMessage.trim(),
    });

    if (!error) {
      setNewMessage("");
      // Refresh messages
      const { data } = await supabase
        .from("messages")
        .select("*")
        .eq("chat_id", selectedChat.id)
        .order("created_at", { ascending: true });
      setMessages(data || []);
    }
  };

  // Tilbake til chat-liste
  const backToChats = () => {
    setSelectedChat(null);
    setMessages([]);
  };

  return (
    <div className="p-4">
      {!selectedChat ? (
        // Listevisning
        <Card className="p-4">
          <CardHeader>
            <CardTitle>Meldinger</CardTitle>
          </CardHeader>
          <CardContent>
            <Input placeholder="Søk etter venner..." className="mb-4" />
            <div className="space-y-3">
              {chats.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => setSelectedChat(chat)}
                  className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent cursor-pointer"
                >
                  <Avatar>
                    <AvatarFallback>
                      {chat.user1 === user?.id ? "U2" : "U1"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">
                      {chat.user1 === user?.id ? chat.user2 : chat.user1}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Trykk for å åpne
                    </p>
                  </div>
                </div>
              ))}
              {chats.length === 0 && (
                <p className="text-center text-muted-foreground">
                  Ingen chatter ennå. Start en ny!
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        // Chatvisning
        <Card className="p-4">
          <CardHeader className="flex justify-between items-center">
            <CardTitle>
              Chat med{" "}
              {selectedChat.user1 === user?.id
                ? selectedChat.user2
                : selectedChat.user1}
            </CardTitle>
            <Button variant="outline" size="sm" onClick={backToChats}>
              Tilbake
            </Button>
          </CardHeader>
          <CardContent className="flex flex-col h-[70vh]">
            <div className="flex-1 overflow-y-auto space-y-2 p-2 border rounded-lg">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-2 rounded-lg max-w-[70%] ${
                    msg.sender_id === user?.id
                      ? "bg-primary text-white self-end ml-auto"
                      : "bg-muted text-foreground self-start"
                  }`}
                >
                  {msg.content}
                </div>
              ))}
              {messages.length === 0 && (
                <p className="text-center text-muted-foreground">
                  Ingen meldinger ennå
                </p>
              )}
            </div>
            <div className="flex gap-2 mt-4">
              <Input
                placeholder="Skriv en melding..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
              <Button onClick={sendMessage}>Send</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
