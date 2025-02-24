import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { RealtimeChannel } from "@supabase/supabase-js";
import type { Message } from "@/types";

export function useMessages(roomId?: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let channel: RealtimeChannel;

    async function fetchMessages() {
      if (!roomId) {
        setMessages([]);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("messages")
          .select(
            `
            *,
            user:users(*)
          `,
          )
          .eq("room_id", roomId)
          .order("created_at", { ascending: true });

        if (error) throw error;
        setMessages(data || []);
      } catch (error) {
        console.error("Error fetching messages:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchMessages();

    // Set up real-time subscription
    if (roomId) {
      channel = supabase
        .channel(`messages:${roomId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
            filter: `room_id=eq.${roomId}`,
          },
          async (payload) => {
            const { data: user } = await supabase
              .from("users")
              .select("*")
              .eq("id", payload.new.user_id)
              .single();

            const newMessage = {
              ...payload.new,
              user,
            };

            setMessages((prev) => [...prev, newMessage]);
          },
        )
        .subscribe();
    }

    return () => {
      if (channel) channel.unsubscribe();
    };
  }, [roomId]);

  const sendMessage = async (content: string) => {
    if (!roomId) return;

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("messages")
        .insert([{ content, user_id: user.id, room_id: roomId }]);

      if (error) throw error;
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return { messages, loading, sendMessage };
}
