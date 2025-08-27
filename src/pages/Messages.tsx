import { useState, useEffect } from "react";
import { supabase } from "../integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function Messages() {
  const [chats, setChats] = useState<any[]>([]);
  const [selectedChat, setSelectedChat] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [friendSearch, setFriendSearch] = useState("");
  const [newMessage, setNewMessage] = useState("");

  const userId = supabase.auth.getUser().then(res => res.data.user?.id);

  // Hent eksisterende chater for innlogget bruker
  const fetchChats = async () => {
    const { data } = await supabase
      .from("chats")
      .select("*")
      .or(`user1.eq.${userId},user2.eq.${userId}`)
      .order("created_at", { ascending: false });
    setChats(data || []);
  };

  // Hent meldinger for valgt chat
  const fetchMessages = async (chatId: string) => {
    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("chat_id", chatId)
      .order("created_at", { ascending: true });
    setMessages(data || []);
  };

  // Start ny chat med venn
  const createChat = async () => {
    if (!friendSearch) return;

    const { data: users } = await supabase
      .from("profiles")
      .select("id, username")
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
      .eq("user1", otherUserId)
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

  // Send ny melding
  const sendMessage = async () => {
    if (!newMessage || !selectedChat) return;

    const { data } = await supabase
      .from("messages")
      .insert([{ chat_id: selectedChat.id, sender: userId, content: newMessage }])
      .select()
      .single();

    setMessages([...messages, data]);
    setNewMessage("");
  };

  useEffect(() => {
    fetchChats();
  }, []);

  useEffect(() => {
    if (selectedChat) fetchMessages(selectedChat.id);
  }, [selectedChat]);

  return (
    <div className="flex h-full gap-4 p-4">
      {/* Venstre kolonne: Chater */}
      <div className="w-1/3 flex flex-col gap-2">
        <Input
          placeholder="Søk etter venn..."
          value={friendSearch}
          onChange={(e) => setFriendSearch(e.target.value)}
        />
        <Button onClick={createChat}>Start Chat</Button>

        <ScrollArea className="mt-2 flex-1">
          {chats.map((chat) => {
            const otherUser = chat.user1 === userId ? chat.user2 : chat.user1;
            return (
              <Card
                key={chat.id}
                className={`mb-2 cursor-pointer ${
                  selectedChat?.id === chat.id ? "border-blue-500 border" : ""
                }`}
                onClick={() => setSelectedChat(chat)}
              >
                <CardContent>
                  <CardTitle>{otherUser}</CardTitle>
                </CardContent>
              </Card>
            );
          })}
        </ScrollArea>
      </div>

      {/* Høyre kolonne: Meldinger */}
      <div className="w-2/3 flex flex-col gap-2">
        <ScrollArea className="flex-1 border rounded p-2">
          {selectedChat ? (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`mb-2 p-2 rounded ${
                  msg.sender === userId ? "bg-blue-100 text-right" : "bg-gray-100"
                }`}
              >
                {msg.content}
              </div>
            ))
          ) : (
            <div>Velg en chat for å starte samtale</div>
          )}
        </ScrollArea>

        {selectedChat && (
          <div className="flex gap-2">
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
