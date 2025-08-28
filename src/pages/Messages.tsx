// src/pages/Messages.tsx

import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client"; // ✅ riktig import
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";

interface Message {
  id: string;
  chat_id: string;
  sender: string;
  content: string;
  created_at: string;
}

const Messages: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [chatId] = useState<string>("your-chat-id"); // TODO: Sett inn dynamisk chat_id

  // 🚀 Hent meldinger ved mount
  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("chat_id", chatId)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching messages:", error);
      } else {
        setMessages(data || []);
      }
      setLoading(false);
    };

    fetchMessages();

    // 🚀 Realtime oppdatering
    const channel = supabase
      .channel("realtime-messages")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatId]);

  // 🚀 Send melding
  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    const { error } = await supabase.from("messages").insert([
      {
        chat_id: chatId,
        sender: (await supabase.auth.getUser()).data.user?.id,
        content: newMessage,
      },
    ]);

    if (error) {
      console.error("Error sending message:", error);
    } else {
      setNewMessage("");
    }
  };

  return (
    <div className="flex flex-col h-screen p-4">
      <div className="flex-1 overflow-y-auto space-y-2">
        {loading ? (
          <p>Laster meldinger...</p>
        ) : messages.length === 0 ? (
          <p>Ingen meldinger ennå</p>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`p-2 rounded-lg max-w-xs ${
                msg.sender === (supabase.auth.getUser()).data.user?.id
                  ? "bg-blue-500 text-white self-end ml-auto"
                  : "bg-gray-200 text-black self-start mr-auto"
              }`}
            >
              {msg.content}
              <div className="text-xs text-gray-500">
                {new Date(msg.created_at).toLocaleTimeString()}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="flex gap-2 mt-4">
        <Input
          placeholder="Skriv en melding..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <Button onClick={sendMessage}>Send</Button>
      </div>
    </div>
  );
};

export default Messages;
