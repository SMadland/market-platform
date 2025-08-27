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

interface Profile {
  id: string;
  username: string;
}

export default function Messages() {
  const [user, setUser] = useState<any>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Profile[]>([]);

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

  // Søk etter venner i profiles-tabellen
  const handleSearch = async (value: string) => {
    setSearchTerm(value);
    if (value.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("id, username")
      .ilike("username", `%${value}%`)
      .neq("id", user?.id) // ikke vis deg selv
      .limit(5);

    if (!error && data) {
      setSearchResults(data);
    }
  };

  // Start ny chat med valgt bruker
  const startChat = async (friendId: string) => {
    if (!user) return;

    // sjekk om chat allerede finnes
    const { data: existing } = await supabase
      .from("chats")
      .select("*")
      .or(`and(user1.eq.${user.id},user2.eq.${friendId}),and(user1.eq.${friendId},user2.eq.${user.id})`);

    if (existing && existing.length > 0) {
      setSelectedChat(existing[0]);
      setSearchResults([]);
      setSearchTerm("");
      return;
    }

    const { data, error } = await supabase
      .from("chats")
      .insert([{ user1: user.id, user2: friendId }])
      .select()
      .single();

    if (!error && data) {
      setChats([data, ...chats]);
      setSelectedChat(data);
      setSearchResults([]);
      setSearchTerm("");
    }
  };

  return (
    <div className="p-4">
      {!selectedChat ? (
        // Listevisning
        <Card className="p-4 shadow-lg rounded-2xl">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Meldinger</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="Søk etter venner..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="mb-4"
            />
            {searchResults.length > 0 && (
              <div className="mb-4 bg-muted rounded-lg p-2">
                {searchResults.map((profile) => (
                  <div
                    key={profile.id}
                    onClick={() => startChat(profile.id)}
                    className="flex items-center gap-3 p-2 rounded-md hover:bg-accent cursor-pointer"
                  >
                    <Avatar>
                      <AvatarFallback>
                        {profile.username?.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <p>{profile.username}</p>
                  </div>
                ))}
              </div>
            )}
            <div className="space-y-3">
              {chats.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => setSelectedChat(chat)}
                  className="flex items-center gap-3 p-3 rounded-lg border shadow-sm hover:bg-accent cursor-pointer"
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
                  Ingen chatter ennå. Søk etter en venn for å starte en!
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        // Chatvisning
        <Card className="p-4 shadow-lg rounded-2xl">
          <CardHeader className="flex justify-between items-center">
            <CardTitle className="text-lg font-semibold">
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
            <div className="flex-1 overflow-y-auto space-y-2 p-2 border rounded-lg bg-muted">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-2 rounded-lg max-w-[70%] ${
                    msg.sender_id === user?.id
                      ? "bg-primary text-white self-end ml-auto"
                      : "bg-white border self-start"
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
