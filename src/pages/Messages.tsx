import { useEffect, useState } from "react";
import { supabase } from "../integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { ScrollArea } from "../components/ui/scroll-area";

interface Profile {
  id: string;
  username: string;
  full_name?: string;
  avatar_url?: string;
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
  const [user, setUser] = useState<Profile | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");

  // Hent innlogget bruker og opprett profil hvis ikke eksisterer
  useEffect(() => {
    async function fetchUser() {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return;

      let { data: profile } = await supabase
        .from<Profile>("profiles")
        .select("*")
        .eq("id", authUser.id)
        .single();

      if (!profile) {
        const { data: newProfile } = await supabase
          .from<Profile>("profiles")
          .insert({ id: authUser.id, username: authUser.email?.split("@")[0] || `user-${uuidv4()}` })
          .select()
          .single();
        profile = newProfile!;
      }

      setUser(profile);
    }
    fetchUser();
  }, []);

  // Hent alle chatter for brukeren
  useEffect(() => {
    if (!user) return;
    async function fetchChats() {
      const { data, error } = await supabase
        .from<Chat>("chats")
        .select("*")
        .or(`user1.eq.${user.id},user2.eq.${user.id}`)
        .order("created_at", { ascending: false });

      if (!error) setChats(data || []);
    }
    fetchChats();
  }, [user]);

  // Hent meldinger for valgt chat
  useEffect(() => {
    if (!selectedChat) return;
    async function fetchMessages() {
      const { data, error } = await supabase
        .from<Message>("messages")
        .select("*")
        .eq("chat_id", selectedChat.id)
        .order("created_at", { ascending: true });
      if (!error) setMessages(data || []);
    }
    fetchMessages();
  }, [selectedChat]);

  // Hent alle brukere for søk
  useEffect(() => {
    async function fetchProfiles() {
      const { data, error } = await supabase
        .from<Profile>("profiles")
        .select("*");
      if (!error) setProfiles(data?.filter(p => p.id !== user?.id) || []);
    }
    if (user) fetchProfiles();
  }, [user]);

  // Opprett ny chat
  const createChat = async (friend: Profile) => {
    if (!user) return;
    // Sjekk om chat allerede finnes
    const existing = chats.find(c =>
      (c.user1 === user.id && c.user2 === friend.id) ||
      (c.user1 === friend.id && c.user2 === user.id)
    );
    if (existing) return setSelectedChat(existing);

    const { data, error } = await supabase
      .from<Chat>("chats")
      .insert({ user1: user.id, user2: friend.id })
      .select()
      .single();
    if (!error && data) {
      setChats([data, ...chats]);
      setSelectedChat(data);
    }
  };

  // Send melding
  const sendMessage = async () => {
    if (!user || !selectedChat || !newMessage.trim()) return;

    const { data, error } = await supabase
      .from<Message>("messages")
      .insert({ chat_id: selectedChat.id, sender: user.id, content: newMessage })
      .select()
      .single();

    if (!error && data) {
      setMessages([...messages, data]);
      setNewMessage("");
    }
  };

  return (
    <div className="flex h-full gap-4 p-4">
      {/* Venstre kolonne: Chatter + søk */}
      <div className="w-1/3 flex flex-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Søk etter venner</CardTitle>
          </CardHeader>
          <CardContent>
            {profiles.map(profile => (
              <Button key={profile.id} className="mb-2 w-full" onClick={() => createChat(profile)}>
                {profile.username}
              </Button>
            ))}
          </CardContent>
        </Card>

        <Card className="flex-1 overflow-y-auto">
          <CardHeader>
            <CardTitle>Dine chatter</CardTitle>
          </CardHeader>
          <CardContent>
            {chats.map(chat => {
              const friendId = chat.user1 === user?.id ? chat.user2 : chat.user1;
              const friend = profiles.find(p => p.id === friendId);
              return (
                <Button key={chat.id} variant="ghost" className="w-full text-left mb-2" onClick={() => setSelectedChat(chat)}>
                  {friend?.username || "Ukjent"}
                </Button>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Høyre kolonne: Meldinger */}
      <div className="flex-1 flex flex-col gap-2">
        <Card className="flex-1 flex flex-col">
          <CardHeader>
            <CardTitle>{selectedChat ? "Samtale" : "Velg en chat"}</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 p-2">
            <ScrollArea className="h-full">
              {messages.map(msg => (
                <div key={msg.id} className={`mb-2 p-2 rounded ${msg.sender === user?.id ? "bg-blue-200 self-end" : "bg-gray-200 self-start"}`}>
                  {msg.content}
                </div>
              ))}
            </ScrollArea>
          </CardContent>
        </Card>

        {selectedChat && (
          <div className="flex gap-2 mt-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Skriv melding..."
            />
            <Button onClick={sendMessage}>Send</Button>
          </div>
        )}
      </div>
    </div>
  );
}
