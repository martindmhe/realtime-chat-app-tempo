import { useState } from "react";
import { Plus, Hash, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";

interface Room {
  id: string;
  name: string;
  created_at: string;
}

interface RoomListProps {
  rooms?: Room[];
  activeRoom?: string;
  onRoomSelect: (roomId: string) => void;
}

export function RoomList({
  rooms = [],
  activeRoom,
  onRoomSelect,
}: RoomListProps) {
  const [open, setOpen] = useState(false);
  const [newRoomName, setNewRoomName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomName.trim()) return;

    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: room, error: roomError } = await supabase
        .from("rooms")
        .insert([
          {
            name: newRoomName.trim(),
            created_by: user.id,
          },
        ])
        .select()
        .single();

      if (roomError) throw roomError;

      // Add creator as member
      const { error: memberError } = await supabase
        .from("room_members")
        .insert([
          {
            room_id: room.id,
            user_id: user.id,
          },
        ]);

      if (memberError) throw memberError;

      setOpen(false);
      setNewRoomName("");
      onRoomSelect(room.id);
    } catch (error) {
      console.error("Error creating room:", error);
      toast({
        variant: "destructive",
        title: "Error creating room",
        description: error.message || "An unknown error occurred",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInviteUser = async (roomId: string) => {
    if (!inviteEmail.trim()) return;

    try {
      // First get the user from public.users table by email
      const { data: user, error: userError } = await supabase
        .from("users")
        .select("id")
        .eq("email", inviteEmail.trim())
        .single();

      if (userError) throw new Error("User not found");

      // Check if user is already a member
      const { data: existingMember, error: memberCheckError } = await supabase
        .from("room_members")
        .select("*")
        .eq("room_id", roomId)
        .eq("user_id", user.id)
        .single();

      if (memberCheckError && memberCheckError.code !== "PGRST116") {
        throw memberCheckError;
      }

      if (existingMember) {
        throw new Error("User is already a member of this room");
      }

      // Add user to room
      const { error: memberError } = await supabase
        .from("room_members")
        .insert([{ room_id: roomId, user_id: user.id }]);

      if (memberError) throw memberError;

      toast({
        title: "User invited",
        description: `Successfully invited ${inviteEmail} to the room`,
      });

      setInviteEmail("");
    } catch (error) {
      console.error("Error inviting user:", error);
      toast({
        variant: "destructive",
        title: "Error inviting user",
        description: error.message || "An unknown error occurred",
      });
    }
  };

  const handleShareLink = (roomId: string) => {
    const url = `${window.location.origin}/join/${roomId}`;
    navigator.clipboard.writeText(url);
    toast({
      title: "Link copied!",
      description: "Share this link with others to join the room",
    });
  };

  return (
    <div className="w-full h-full bg-background border rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">Rooms</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="icon" variant="ghost">
              <Plus className="h-5 w-5" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Room</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateRoom} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Room Name</Label>
                <Input
                  id="name"
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  placeholder="Enter room name"
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Creating..." : "Create Room"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <ScrollArea className="h-[calc(100%-3rem)]">
        <div className="space-y-2">
          {rooms.map((room) => (
            <div key={room.id} className="space-y-2">
              <Button
                variant={activeRoom === room.id ? "secondary" : "ghost"}
                className="w-full justify-start text-white"
                onClick={() => onRoomSelect(room.id)}
              >
                <Hash className="h-4 w-4 mr-2" />
                {room.name}
              </Button>
              <div className="pl-8 space-y-2">
                <div className="flex gap-2">
                  <Input
                    size="sm"
                    placeholder="Invite by email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                  <Button
                    className="text-white"
                    size="sm"
                    variant="outline"
                    onClick={() => handleInviteUser(room.id)}
                  >
                    Invite
                  </Button>
                </div>
                <Button
                  className="w-full text-white"
                  size="sm"
                  variant="outline"
                  onClick={() => handleShareLink(room.id)}
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Link
                </Button>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
