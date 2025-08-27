import { useEffect, useState } from "react";
import { getChatsForUser, sendMessage } from "@/services/chatService";

export default function ChatPage() {
  const currentUserId = "PUT_USER_ID_HERE"; // Du bør hente fra Supabase auth
  const [chats, setChats] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    async function fetchChats() {
      const data = await getChatsForUser(currentUserId);
      setChats(data || []);
    }
    fetchChats();
  }, []);

  const handleSend = async (chatId: string) => {
    if (!newMessage) return;
    await sendMessage(chatId, currentUserId, newMessage);
    setNewMessage("");
    const updated = await getChatsForUser(currentUserId);
    setChats(updated || []);
  };

  return (
    <div>
      <h1>Chats</h1>
      {chats.map(chat => (
        <div key={chat.id} style={{ border: "1px solid #ccc", margin: "10px", padding: "10px" }}>
          <h2>Chat: {chat.id}</h2>
          <div>
            {chat.messages?.map((msg: any) => (
              <p key={msg.id}><strong>{msg.sender}:</strong> {msg.content}</p>
            ))}
          </div>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <button onClick={() => handleSend(chat.id)}>Send</button>
        </div>
      ))}
    </div>
  );
}
