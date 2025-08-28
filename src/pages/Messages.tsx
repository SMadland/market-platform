// src/pages/Messages.tsx
import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { ScrollArea } from '../components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { useAuth } from '../hooks/useAuth';

interface Profile {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
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
}

export default function Messages() {
  const { user } = useAuth();
  const [friends, setFriends] = useState<Profile[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');

  // Hent venner
  useEffect(() => {
    if (!user) return;
    supabase
      .from('profiles')
      .select('id, username, display_name, avatar_url')
      .neq('id', user.id)
      .then(({ data, error }) => {
        if (!error && data) setFriends(data);
      });
  }, [user]);

  // Hent chats
  useEffect(() => {
    if (!user) return;
    supabase
      .from('chats')
      .select('*')
      .or(`user1.eq.${user.id},user2.eq.${user.id}`)
      .order('updated_at', { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) setChats(data);
      });
  }, [user]);

  // Hent meldinger for valgt chat
  useEffect(() => {
    if (!selectedChat) return;
    supabase
      .from('messages')
      .select('*')
      .eq('chat_id', selectedChat.id)
      .order('created_at', { ascending: true })
      .then(({ data, error }) => {
        if (!error && data) setMessages(data);
      });
  }, [selectedChat]);

  const handleStartChat = async (friendId: string) => {
    if (!user) return;
    const { data, error } = await supabase
      .from('chats')
      .insert([{ user1: user.id, user2: friendId }])
      .select()
      .single();

    if (error && error.code !== '23505') {
      console.error('Error creating chat:', error);
      return;
    }
    if (data) {
      setChats((prev) => [...prev, data]);
      setSelectedChat(data);
    }
  };

  const handleSendMessage = async () => {
    if (!user || !selectedChat || !newMessage.trim()) return;
    const { data, error } = await supabase
      .from('messages')
      .insert([{ chat_id: selectedChat.id, sender: user.id, content: newMessage }])
      .select()
      .single();

    if (!error && data) {
      setMessages((prev) => [...prev, data]);
      setNewMessage('');
    }
  };

  return (
    <div className="flex h-screen">
      <Card className="w-1/3 border-r">
        <h2 className="p-4 font-semibold text-lg">Meldinger</h2>
        <ScrollArea className="h-[calc(100vh-64px)]">
          {friends.map((friend) => (
            <div
              key={friend.id}
              className="flex items-center gap-3 p-3 hover:bg-gray-100 cursor-pointer"
              onClick={() => handleStartChat(friend.id)}
            >
              <Avatar>
                <AvatarImage src={friend.avatar_url || ''} />
                <AvatarFallback>{friend.username[0].toUpperCase()}</AvatarFallback>
              </Avatar>
              <span>{friend.display_name || friend.username}</span>
            </div>
          ))}
        </ScrollArea>
      </Card>

      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            <ScrollArea className="flex-1 p-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`mb-2 flex ${msg.sender === user?.id ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`px-3 py-2 rounded-2xl ${
                      msg.sender === user?.id ? 'bg-blue-500 text-white' : 'bg-gray-200'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
            </ScrollArea>

            <div className="flex items-center gap-2 p-4 border-t">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Skriv en melding..."
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <Button onClick={handleSendMessage}>Send</Button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Velg en venn for å starte en samtale
          </div>
        )}
      </div>
    </div>
  );
}
