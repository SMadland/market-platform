import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
}

const Chat = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      senderId: "123",
      senderName: "Alice",
      text: "Hey, how are you?",
      timestamp: "2023-08-25T12:00:00Z",
    },
    {
      id: "2",
      senderId: "me",
      senderName: user?.name || "Me",
      text: "I'm good! How about you?",
      timestamp: "2023-08-25T12:01:00Z",
    },
  ]);

  const [newMessage, setNewMessage] = useState("");

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const msg: Message = {
      id: Date.now().toString(),
      senderId: user?.id || "me",
      senderName: user?.name || "Me",
      text: newMessage,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, msg]);
    setNewMessage("");

    toast({
      title: "Message sent",
      description: msg.text,
    });
  };

  return (
    <div className="p-6 flex flex-col h-full">
      <h1 className="text-2xl font-bold mb-4">Chat</h1>

      {/* Messages area */}
      <Card className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-2 ${
              msg.senderId === user?.id || msg.senderId === "me"
                ? "justify-end"
                : "justify-start"
            }`}
          >
            {msg.senderId !== user?.id && msg.senderId !== "me" && (
              <Avatar className="w-8 h-8">
                <AvatarImage src="" />
                <AvatarFallback>{msg.senderName[0]}</AvatarFallback>
              </Avatar>
            )}
            <div
              className={`p-2 rounded-lg max-w-xs ${
                msg.senderId === user?.id || msg.senderId === "me"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200"
              }`}
            >
              <p className="text-sm">{msg.text}</p>
              <span className="text-xs opacity-70">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </span>
            </div>
          </div>
        ))}
      </Card>

      {/* Input area */}
      <div className="flex mt-4 gap-2">
        <Input
          placeholder="Type your message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
        />
        <Button onClick={handleSendMessage}>Send</Button>
      </div>
    </div>
  );
};

export default Chat;
