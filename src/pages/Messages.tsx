import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";

interface Message {
  id: string;
  chat_id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

interface Chat {
  id: string;
  user1: string;
  user2: string;
  updated_at: string;
}

interface Profile {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string;
}

const Messages: React.FC = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [loadingChats, setLoadingChats] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const user = supabase.auth.getUser();

  // Fetch all chats for current user
  useEffect(() => {
    const fetchChats = async () => {
      setLoadingChats(true);
      const { data, error } = await supabase
        .from("chats")
        .select("*")
        .or(`user1.eq.${user.id},user2.eq.${user.id}`)
        .order("updated_at", { ascending: false });
      if (error) {
        console.error("Error fetching chats:", error.message);
      } else {
        setChats(data || []);
      }
      setLoadingChats(false);
    };
    fetchChats();
  }, [user]);

  // Fetch messages for selected chat
  useEffect(() => {
    if (!activeChat) return;
    const fetchMessages = async () => {
      setLoadingMessages(true);
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("chat_id", activeChat.id)
        .order("created_at", { ascending: true });
      if (error) {
        console.error("Error fetching messages:", error.message);
      } else {
        setMessages(data || []);
      }
      setLoadingMessages(false);
    };
    fetchMessages();

    // Realtime subscription
    const subscription = supabase
      .channel("messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `chat_id=eq.${activeChat.id}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [activeChat]);

  // Fetch profile data for users in chats
  useEffect(() => {
    const fetchProfiles = async () => {
      const ids = chats
        .map((c) => [c.user1, c.user2])
        .flat()
        .filter((id, index, arr) => arr.indexOf(id) === index);
      if (ids.length === 0) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, display_name, avatar_url")
        .in("id", ids);

      if (error) {
        console.error("Error fetching profiles:", error.message);
      } else if (data) {
        const map: Record<string, Profile> = {};
        data.forEach((p) => {
          map[p.id] = p;
        });
        setProfiles(map);
      }
    };
    fetchProfiles();
  }, [chats]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !activeChat) return;
    const { error } = await supabase.from("messages").insert({
      chat_id: activeChat.id,
      sender_id: user.id,
      content: newMessage,
    });
    if (error) {
      console.error("Error sending message:", error.message);
    } else {
      setNewMessage("");
    }
  };

  return (
    <div className="grid grid-cols-4 h-full">
      {/* Sidebar - Chats */}
      <div className="col-span-1 border-r p-4 overflow-y-auto">
        <h2 className="font-bold text-lg mb-4">Chats</h2>
        {loadingChats ? (
          <p>Loading chats...</p>
        ) : chats.length === 0 ? (
          <p>No chats found.</p>
        ) : (
          chats.map((chat) => {
            const otherUserId =
              chat.user1 === user.id ? chat.user2 : chat.user1;
            const profile = profiles[otherUserId];
            return (
              <div
                key={chat.id}
                className={`p-2 rounded-lg cursor-pointer mb-2 ${
                  activeChat?.id === chat.id
                    ? "bg-blue-100"
                    : "hover:bg-gray-100"
                }`}
                onClick={() => setActiveChat(chat)}
              >
                <div className="flex items-center space-x-2">
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt="avatar"
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-300" />
                  )}
                  <span>{profile?.display_name || profile?.username || "Unknown"}</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Main - Messages */}
      <div className="col-span-3 flex flex-col">
        {activeChat ? (
          <>
            <div className="flex-1 p-4 overflow-y-auto">
              {loadingMessages ? (
                <p>Loading messages...</p>
              ) : messages.length === 0 ? (
                <p>No messages yet.</p>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`mb-2 ${
                      msg.sender_id === user.id ? "text-right" : "text-left"
                    }`}
                  >
                    <div
                      className={`inline-block px-3 py-2 rounded-xl ${
                        msg.sender_id === user.id
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200"
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="p-4 border-t flex space-x-2">
              <Input
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              />
              <Button onClick={sendMessage}>Send</Button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p>Select a chat to start messaging.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;
