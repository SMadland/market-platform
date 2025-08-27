import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";

export default function Messages() {
  const [user, setUser] = useState<any>(null);
  const [chats, setChats] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [selectedChat, setSelectedChat] = useState<any>(null);
  const [newMessage, setNewMessage] = useState("");
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<any[]>([]);

  // Hent innlogget bruker
  useEffect(() => {
    const getUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) console.error(error);
      setUser(data.user);
    };
    getUser();
  }, []);

  // Hent eksisterende chatter
  useEffect(() => {
    if (!user) return;
    const loadChats = async () => {
      const { data, error } = await supabase
        .from("chats")
        .select("id, user1, user2")
        .or(`user1.eq.${user.id},user2.eq.${user.id}`);
      if (error) console.error(error);
      setChats(data || []);
    };
    loadChats();
  }, [user]);

  // Hent meldinger for valgt chat
  useEffect(() => {
    if (!selectedChat) return;
    const loadMessages = async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("chat_id", selectedChat.id)
        .order("created_at", { ascending: true });
      if (error) console.error(error);
      setMessages(data || []);
    };
    loadMessages();
  }, [selectedChat]);

  // Søk etter venner i profiles (bruker user_id, ikke id!)
  const handleSearch = async () => {
    if (!search) return;
    const { data, error } = await supabase
      .from("profiles")
      .select("user_id, username")
      .ilike("username", `%${search}%`);
    if (error) console.error(error);
    setResults(data || []);
  };

  // Opprett ny chat
  const startChat = async (otherUserId: string) => {
    if (!user) return;
    const { data, error } = await supabase
      .from("chats")
      .insert([{ user1: user.id, user2: otherUserId }])
      .select()
      .single();
    if (error) {
      console.error("Error creating chat:", error);
      return;
    }
    setChats([...chats, data]);
    setSelectedChat(data);
    setResults([]);
    setSearch("");
  };

  // Send melding
  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedChat || !user) return;
    const { data, error } = await supabase
      .from("messages")
      .insert([
        { chat_id: selectedChat.id, sender_id: user.id, content: newMessage },
      ])
      .select()
      .single();
    if (error) console.error(error);
    setMessages([...messages, data]);
    setNewMessage("");
  };

  return (
    <div className="flex h-screen">
      {/* Venstre kolonne: chatter og søk */}
      <Card className="w-1/3 border-r">
        <CardHeader>
          <CardTitle>Meldinger</CardTitle>
          <div className="flex space-x-2 mt-2">
            <Input
              placeholder="Søk etter venner..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Button onClick={handleSearch}>Søk</Button>
          </div>
        </CardHeader>
        <CardContent>
          {results.length > 0 ? (
            <div>
              {results.map((r) => (
                <div
                  key={r.user_id}
                  className="p-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => startChat(r.user_id)}
                >
                  {r.username}
                </div>
              ))}
            </div>
          ) : (
            <div>
              {chats.map((chat) => (
                <div
                  key={chat.id}
                  className="p-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => setSelectedChat(chat)}
                >
                  Chat {chat.id}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Høyre kolonne: meldinger */}
      <div className="flex flex-col w-2/3">
        {selectedChat ? (
          <>
            <div className="flex-1 overflow-y-auto p-4">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`p-2 mb-2 rounded ${
                    m.sender_id === user.id
                      ? "bg-blue-500 text-white self-end"
                      : "bg-gray-200"
                  }`}
                >
                  {m.content}
                </div>
              ))}
            </div>
            <div className="p-2 flex border-t">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Skriv en melding..."
              />
              <Button onClick={sendMessage} className="ml-2">
                Send
              </Button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Velg en chat for å starte samtale
          </div>
        )}
      </div>
    </div>
  );
}
