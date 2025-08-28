import React, { useEffect, useState } from "react";
import { supabase } from "@/supabaseClient"; // ✅ bruker alias, evt "../supabaseClient" hvis du ikke vil bruke vite.config.ts
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";

interface Chat {
  id: string;
  user1: string;
  user2: string;
  updated_at: string;
}

export default function Messages() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChats = async () => {
      setLoading(true);

      // 👇 test: hent gjeldende bruker
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.error("Feil ved henting av bruker:", userError.message);
        setLoading(false);
        return;
      }

      if (!user) {
        console.warn("Ingen bruker er logget inn");
        setLoading(false);
        return;
      }

      // 👇 hent chats der brukeren er user1 eller user2
      const { data, error } = await supabase
        .from("chats")
        .select("*")
        .or(`user1.eq.${user.id},user2.eq.${user.id}`)
        .order("updated_at", { ascending: false });

      if (error) {
        console.error("Feil ved henting av chats:", error.message);
      } else {
        console.log("Chats hentet:", data);
        setChats(data || []);
      }

      setLoading(false);
    };

    fetchChats();
  }, []);

  if (loading) return <p>Laster...</p>;

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Meldinger</h1>

      {chats.length === 0 ? (
        <p>Ingen samtaler funnet.</p>
      ) : (
        <ul className="space-y-2">
          {chats.map((chat) => (
            <li key={chat.id} className="p-2 border rounded-lg">
              <p>
                <strong>Chat ID:</strong> {chat.id}
              </p>
              <p>
                <strong>Brukere:</strong> {chat.user1} & {chat.user2}
              </p>
              <p>
                <strong>Sist oppdatert:</strong>{" "}
                {new Date(chat.updated_at).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
