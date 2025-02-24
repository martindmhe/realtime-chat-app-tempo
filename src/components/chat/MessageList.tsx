import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { TypingIndicator } from "./TypingIndicator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
  user?: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
  isSelf?: boolean;
}

interface MessageListProps {
  messages?: Message[];
}

import { useAuth } from "@/hooks/useAuth";

const defaultMessages: Message[] = [
  {
    id: "1",
    content: "Hey there! How are you?",
    sender: {
      id: "1",
      name: "John Doe",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
    },
    timestamp: "10:00 AM",
    isSelf: false,
  },
  {
    id: "2",
    content: "I'm doing great! Thanks for asking. How about you?",
    sender: {
      id: "2",
      name: "Jane Smith",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jane",
    },
    timestamp: "10:02 AM",
    isSelf: true,
  },
  {
    id: "3",
    content: "Pretty good! Just working on some new features.",
    sender: {
      id: "1",
      name: "John Doe",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
    },
    timestamp: "10:05 AM",
    isSelf: false,
  },
];

const MessageBubble = ({ message }: { message: Message }) => {
  const { user } = useAuth();
  const isSelf = message.user_id === user?.id;

  return (
    <div
      className={cn(
        "flex items-start gap-2 mb-4",
        isSelf ? "flex-row-reverse" : "flex-row",
      )}
    >
      <div
        className={cn(
          "max-w-[70%] rounded-lg px-4 py-2",
          isSelf ? "bg-primary text-primary-foreground" : "bg-muted",
        )}
      >
        <div className="flex flex-col">
          <span className="text-sm font-medium">{message.user?.full_name}</span>
          <p className="text-sm">{message.content}</p>
          <span className="text-xs opacity-70 mt-1">
            {new Date(message.created_at).toLocaleTimeString()}
          </span>
        </div>
      </div>
    </div>
  );
};

const MessageList = ({ messages = defaultMessages }: MessageListProps) => {
  const [typingUsers, setTypingUsers] = useState<
    { id: string; full_name: string }[]
  >([]);
  const { user } = useAuth();

  useEffect(() => {
    const channel = supabase
      .channel("typing")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "typing_users" },
        async () => {
          const { data } = await supabase
            .from("typing_users")
            .select("user_id, users:users(id, full_name)")
            .eq("is_typing", true);

          setTypingUsers(
            data
              ?.filter((tu) => tu.user_id !== user?.id)
              .map((tu) => tu.users as { id: string; full_name: string }) || [],
          );
        },
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [user?.id]);
  return (
    <div className="h-full bg-background border rounded-lg">
      <ScrollArea className="h-full p-4">
        <div className="flex flex-col">
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
          <TypingIndicator names={typingUsers.map((u) => u.full_name)} />
        </div>
      </ScrollArea>
    </div>
  );
};

export default MessageList;
