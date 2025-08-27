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
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");

  // Erstatt med innlogget bruker sin ID
  const userId = "44c1de38-c815-4070-9369-babc4cfc7e0b"; 

  // Hent alle chater brukeren er med i
  const fetchChats = async () => {
    const { data, error } = await supabase
      .from("chats")
      .select("*")
      .or(`user1.eq.${userId},user2.eq.${userId}`)
      .order("created_at", { ascending: false });

    if (error) console.error("Error fetching chats:", error);
    else setChats(data as Chat[]);
  };

  // Hent meldinger for valgt chat
  const fetchMessages = async (chatId: string) => {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("chat_id", chatId)
      .order("created_at", { ascending: true });

    if (error) console.error("Error fetching messages:", error);
    else setMessages(data as Message[]);
  };

  // Opprett ny chat
  const createChat = async (otherUserId: string) => {
    const { data, error } = await supabase
      .from("chats")
      .insert([{ user1: userId, user2: otherUserId }])
      .select();

    if (error) console.error("Error creating chat:", error);
    else if (data) {
      setChats([...(chats || []), data[0]]);
      setSelectedChat(data[0]);
      setMessages([]);
    }
  };

  // Send ny melding
  const sendMessage = async () => {
    if (!selectedChat || !newMessage) return;

    const { data, error } = await supabase
      .from("messages")
      .insert([
        {
          id: uuidv4(),
          chat_id: selectedChat.id,
          sender: userId,
          content: newMessage,
        },
      ])
      .select();

    if (error) console.error("Error sending message:", error);
    else if (data) {
      setMessages([...messages, data[0]]);
      setNewMessage("");
    }
  };

  useEffect(() => {
    fetchChats();
  }, []);

  useEffect(() => {
    if (selectedChat) fetchMessages(selectedChat.id);
  }, [selectedChat]);

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <div style={{ width: "250px", borderRight: "1px solid gray" }}>
        <h3>Chater</h3>
        <button onClick={() => createChat(prompt("Skriv bruker-ID:") || "")}>
          Ny Chat
        </button>
        <ul>
          {chats.map((chat) => (
            <li
              key={chat.id}
              onClick={() => setSelectedChat(chat)}
              style={{
                cursor: "pointer",
                fontWeight: selectedChat?.id === chat.id ? "bold" : "normal",
              }}
            >
              {chat.user1 === userId ? chat.user2 : chat.user1}
            </li>
          ))}
        </ul>
      </div>

      <div style={{ flex: 1, padding: "1rem" }}>
        <h3>Meldinger</h3>
        <div
          style={{
            border: "1px solid gray",
            height: "80%",
            overflowY: "scroll",
            padding: "0.5rem",
            marginBottom: "1rem",
          }}
        >
          {messages.map((msg) => (
            <div key={msg.id}>
              <strong>{msg.sender === userId ? "Meg" : msg.sender}:</strong>{" "}
              {msg.content}
            </div>
          ))}
        </div>

        {selectedChat && (
          <div>
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Skriv melding..."
            />
            <button onClick={sendMessage}>Send</button>
          </div>
        )}
      </div>
    </div>
  );
}
