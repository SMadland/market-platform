import { useEffect, useState } from "react";
import { supabase } from "../integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";

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
  const [user, setUser] = useState<any>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");

  // Hent innlogget bruker
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });
  }, []);

  // Hent chatter
  useEffect(() => {
    if (!user) return;
    const loadChats = async () => {
      const { data } = await supabase
        .from("chats")
        .select("*")
        .or(`user1.eq.${user.id},user2.eq.${user.id}`)
        .order("created_at", { ascending: false });
      if (data) setChats(data);
    };
    loadChats();
  }, [user]);

  // Hent meldinger for valgt chat
  useEffect(() => {
    if (!selectedChat) return;
    const loadMessages = async () => {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .eq("chat_id", selectedChat.id)
        .order("created_at", { ascending: true });
      if (data) setMessages(data);
    };
    loadMessages();

    const channel = supabase
      .channel("messages")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `chat_id=eq.${selectedChat.id}` },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [selectedChat]);

  // Send melding
  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedChat) return;
    await supabase.from("messages").insert([
      {
        id: uuidv4(),
        chat_id: selectedChat.id,
        sender: user.id,
        content: newMessage.trim(),
      },
    ]);
    setNewMessage("");
  };

  return (
    <div className="flex h-screen">
      {/* Chat-liste */}
      <div className="w-1/3 border-r overflow-y-auto">
        <h2 className="p-4 font-bold">Dine chatter</h2>
        {chats.map((chat) => (
          <div
            key={chat.id}
            className={`p-4 cursor-pointer hover:bg-gray-100 ${
              selectedChat?.id === chat.id ? "bg-gray-200" : ""
            }`}
            onClick={() => setSelectedChat(chat)}
          >
            Chat med {chat.user1 === user.id ? chat.user2 : chat.user1}
          </div>
        ))}
      </div>

      {/* Meldingsvindu */}
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            <div className="flex-1 overflow-y-auto p-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`mb-2 ${
                    msg.sender === user.id ? "text-right" : "text-left"
                  }`}
                >
                  <span
                    className={`inline-block px-3 py-2 rounded-lg ${
                      msg.sender === user.id
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 text-black"
                    }`}
                  >
                    {msg.content}
                  </span>
                </div>
              ))}
            </div>
            <div className="p-4 border-t flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1 border rounded p-2"
                placeholder="Skriv en melding..."
              />
              <button
                onClick={sendMessage}
                className="bg-blue-500 text-white px-4 py-2 rounded"
              >
                Send
              </button>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center flex-1">
            <p>Velg en chat for å starte</p>
          </div>
        )}
      </div>
    </div>
  );
}
