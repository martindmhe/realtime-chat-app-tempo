import React from "react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface User {
  id: string;
  name: string;
  avatar?: string;
  status: "online" | "offline";
  lastSeen?: string;
}

interface UserPresenceProps {
  users?: User[];
}

const defaultUsers: User[] = [
  {
    id: "1",
    name: "John Doe",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
    status: "online",
  },
  {
    id: "2",
    name: "Jane Smith",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jane",
    status: "offline",
    lastSeen: "5m ago",
  },
  {
    id: "3",
    name: "Mike Johnson",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mike",
    status: "online",
  },
  {
    id: "4",
    name: "Sarah Wilson",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    status: "offline",
    lastSeen: "2h ago",
  },
];

const UserPresence = ({ users = defaultUsers }: UserPresenceProps) => {
  const onlineUsers = users.filter((user) => user.status === "online");
  const offlineUsers = users.filter((user) => user.status === "offline");

  return (
    <div className="w-full h-full bg-background border rounded-lg p-4">
      <h2 className="text-lg font-semibold mb-4">People</h2>

      <ScrollArea className="h-[calc(100%-2rem)]">
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium">Online</h3>
              <Badge variant="secondary">{onlineUsers.length}</Badge>
            </div>
            <div className="space-y-2">
              {onlineUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-accent"
                >
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500 ring-2 ring-background" />
                  <span className="text-sm">{user.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium">Offline</h3>
              <Badge variant="secondary">{offlineUsers.length}</Badge>
            </div>
            <div className="space-y-2">
              {offlineUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-accent"
                >
                  <div className="w-2.5 h-2.5 rounded-full bg-gray-400 ring-2 ring-background" />
                  <div className="flex flex-col">
                    <span className="text-sm">{user.name}</span>
                    {user.lastSeen && (
                      <span className="text-xs text-muted-foreground">
                        {user.lastSeen}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default UserPresence;
