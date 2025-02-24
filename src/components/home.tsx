import React, { useState } from "react";
import ChatContainer from "@/components/chat/ChatContainer";
import { useMessages } from "@/hooks/useMessages";
import { useRooms } from "@/hooks/useRooms";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { supabase } from "@/lib/supabase";

const Home = () => {
  const [activeRoom, setActiveRoom] = useState<string>();
  const { messages, loading, sendMessage } = useMessages(activeRoom);
  const { rooms } = useRooms();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="min-h-screen w-full bg-background p-4 md:p-6 lg:p-8 text-white">
      <div className="mx-auto max-w-7xl h-[calc(100vh-4rem)]">
        <div className="flex flex-col h-full gap-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white">Chat</h1>
            <Button variant="ghost" size="icon" onClick={handleSignOut}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
          <div className="flex-1 min-h-0">
            <ChatContainer
              messages={messages}
              rooms={rooms}
              activeRoom={activeRoom}
              onRoomSelect={setActiveRoom}
              isLoading={loading}
              onSendMessage={sendMessage}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
