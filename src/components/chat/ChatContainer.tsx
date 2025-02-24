import React from "react";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import { RoomList } from "./RoomList";

interface Room {
  id: string;
  name: string;
  created_at: string;
}

interface ChatContainerProps {
  messages?: any[];
  rooms?: Room[];
  activeRoom?: string;
  onRoomSelect?: (roomId: string) => void;
  onSendMessage?: (message: string) => void;
  isLoading?: boolean;
}

const ChatContainer = ({
  messages = [],
  rooms = [],
  activeRoom,
  onRoomSelect = () => {},
  onSendMessage = () => {},
  isLoading = false,
}: ChatContainerProps) => {
  return (
    <div className="flex h-full w-full gap-4 bg-background p-4">
      <div className="w-[250px] hidden md:block">
        <RoomList
          rooms={rooms}
          activeRoom={activeRoom}
          onRoomSelect={onRoomSelect}
        />
      </div>
      <div className="flex-1 flex flex-col h-full">
        <div className="flex-1 mb-4">
          <MessageList messages={messages} />
        </div>
        <MessageInput
          onSendMessage={onSendMessage}
          disabled={isLoading}
          placeholder={isLoading ? "Loading..." : "Type a message..."}
        />
      </div>
      <div className="w-[250px] hidden md:block">
        {/* UserPresence component placeholder - to be implemented */}
      </div>
    </div>
  );
};

export default ChatContainer;
