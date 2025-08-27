import React, { useEffect, useState } from "react";
import { supabase } from "../integrations/supabase/client";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { ScrollArea } from "../components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { useAuth } from "../hooks/useAuth";
import { v4 as uuidv4 } from "uuid";
import { Loader2 } from "lucide-react";

interface Profile {
  id: string;
  username: string;
  display_name?: string;
  avatar_url?: string;
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
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [search, setSearch] = useState("");
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchProfiles = async () => {
    if (!user) return;
    let query = supabase.from("profiles").select("*");
    if (search.trim()) query = query.ilike("username", `%${search}%`);
    const { data, error } = await query;
    if (error) console.error(error);
    else setProfiles(data || []);
  };

  const fetchChats = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("chats")
      .select("*")
      .or(`user1.eq.${user.id},user2.eq.${user.id}`)
      .order("created_at", { ascending: false });
    if (error) console.error(error);
    else setChats(data || []);
  };

  const fetchMessages = async (chatId: string) => {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("chat_id", chatId)
      .order("created_at", { ascending: true });
    if (error) console.error(error);
    else setMessages(data || []);
  };

  const handleSelectChat = async (chat: Chat) => {
    setSelectedChat(chat);
    await fetchMessages(chat.id);
  };

  const handleStartChat = async (profileId: string) => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from("chats")
        .insert([{ user1: user.id, user2: profileId }])
        .select()
        .maybeSingle();
      if (error) throw error;
      if (data) fetchChats();
    } catch (error) {
      console.error("Error creating chat:", error);
    }
  };

  const handleSendMessage = async () => {
    if (!selectedChat || !newMessage.trim() || !user) return;
    try {
      const { data, error } = await supabase
        .from("messages")
        .insert([{
          chat_id: selectedChat.id,
          sender: user.id,
          content: newMessage
        }])
        .select()
        .maybeSingle();
      if (error) throw error;
      setMessages(prev => [...prev, data]);
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  useEffect(() => {
    fetchChats();
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchProfiles();
  }, [search]);

  if (loading) return <Loader2 className="w-8 h-8 animate-spin mx-auto mt-20" />;

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-background p-4 gap-4">
      {/* Venstre kolonne: Søk og chatter */}
      <Card className="w-full md:w-1/3 p-4">
        <Input 
          placeholder="Søk etter venner..." 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
          className="mb-4"
        />
        <ScrollArea className="h-[60vh]">
          {profiles.map((profile) => (
            <Card key={profile.id} className="p-2 mb-2 cursor-pointer hover:bg-accent/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Avatar className="w-8 h-8">
                  {profile.avatar_url ? (
                    <AvatarImage src={profile.avatar_url} />
                  ) : (
                    <AvatarFallback>{profile.display_name?.[0] || profile.username[0]}</AvatarFallback>
                  )}
                </Avatar>
                <span>{profile.display_name || profile.username}</span>
              </div>
              <Button size="sm" onClick={() => handleStartChat(profile.id)}>Start chat</Button>
            </Card>
          ))}
          <h3 className="mt-4 mb-2 font-semibold">Dine chatter</h3>
          {chats.map((chat) => {
            const otherUserId = chat.user1 === user?.id ? chat.user2 : chat.user1;
            const otherUser = profiles.find(p => p.id === otherUserId);
            return (
              <Card 
                key={chat.id} 
                className={`p-2 mb-2 cursor-pointer hover:bg-accent/10 ${selectedChat?.id === chat.id ? 'bg-accent/20' : ''}`}
                onClick={() => handleSelectChat(chat)}
              >
                <div className="flex items-center gap-2">
                  <Avatar className="w-8 h-8">
                    {otherUser?.avatar_url ? (
                      <AvatarImage src={otherUser.avatar_url} />
                    ) : (
                      <AvatarFallback>{otherUser?.display_name?.[0] || otherUser?.username?.[0]}</AvatarFallback>
                    )}
                  </Avatar>
                  <span>{otherUser?.display_name || otherUser?.username || "Bruker"}</span>
                </div>
              </Card>
            )
          })}
        </ScrollArea>
      </Card>

      {/* Høyre kolonne: Meldinger */}
      <Card className="w-full md:w-2/3 p-4 flex flex-col">
        {selectedChat ? (
          <>
            <ScrollArea className="flex-1 mb-4">
              {messages.map((msg) => {
                const isMe = msg.sender === user?.id;
                return (
                  <div 
                    key={msg.id} 
                    className={`mb-2 p-2 rounded ${isMe ? "bg-primary/20 self-end" : "bg-muted-foreground/10 self-start"}`}
                  >
                    {msg.content}
                  </div>
                )
              })}
            </ScrollArea>
            <div className="flex gap-2">
              <Input 
                placeholder="Skriv en melding..." 
                value={newMessage} 
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleSendMessage}>Send</Button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            Velg en chat for å starte samtale
          </div>
        )}
      </Card>
    </div>
  );
}
