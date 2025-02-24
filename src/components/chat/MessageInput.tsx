import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Smile } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface MessageInputProps {
  onSendMessage?: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

const MessageInput = ({
  onSendMessage = () => {},
  disabled = false,
  placeholder = "Type a message...",
}: MessageInputProps) => {
  const [message, setMessage] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    const updateTypingStatus = async (isTyping: boolean) => {
      if (!user) return;

      await supabase
        .from("typing_users")
        .upsert({ user_id: user.id, is_typing: isTyping })
        .select();
    };

    if (message.trim()) {
      updateTypingStatus(true);
    } else {
      updateTypingStatus(false);
    }

    return () => {
      updateTypingStatus(false);
    };
  }, [message, user]);

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message);
      setMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="w-full bg-background border-t p-4 flex items-center gap-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="flex-shrink-0"
              disabled={disabled}
            >
              <Smile className="h-5 w-5 text-white" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Add emoji</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <Input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyPress}
        placeholder={placeholder}
        disabled={disabled}
        className="flex-1 text-white"
      />

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={handleSend}
              disabled={disabled || !message.trim()}
              className="flex-shrink-0"
            >
              <Send className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Send message</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default MessageInput;
